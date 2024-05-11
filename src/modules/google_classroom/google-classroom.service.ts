import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { google } from 'googleapis';
import { randomUUID } from 'crypto';
import { User } from 'src/entities';
import { GoogleClassroomInfoDto } from './dtos/GoogleClassroomInfo.dto';
import { ImportClassInfoDto } from './dtos/ImportClass.dto';
import { Class } from 'src/entities/class.entity';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Role } from 'src/common/enum/common.enum';
import e from 'express';
import { generatePastelColor } from 'src/common/utils/utils';
import { MailerService } from '@nest-modules/mailer';

@Injectable()
export class GoogleClassroomService {
  private oAuth2Client;
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectRepository(Class)
    private readonly classRepository: EntityRepository<Class>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly mailerService: MailerService,
  ) {
    this.oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CLIENT_REDIRECT_URL,
    );
  }

  async authorize() {
    try {
      // Use the access token to authorize the user

      const scopes = [
        'https://www.googleapis.com/auth/classroom.courses.readonly',
        'https://www.googleapis.com/auth/classroom.course-work.readonly',
        'https://www.googleapis.com/auth/classroom.coursework.students',
        'https://www.googleapis.com/auth/classroom.courseworkmaterials',
        'https://www.googleapis.com/auth/classroom.topics',
        'https://www.googleapis.com/auth/classroom.announcements',
        'https://www.googleapis.com/auth/classroom.announcements',
        'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
        'https://www.googleapis.com/auth/classroom.addons.student',
        'https://www.googleapis.com/auth/classroom.addons.teacher',
        'https://www.googleapis.com/auth/classroom.profile.emails',
        'https://www.googleapis.com/auth/classroom.profile.photos',
        'https://www.googleapis.com/auth/classroom.rosters',
      ];

      // Generate a secure random state value.
      // const state = crypto.randomBytes(16).toString('hex');

      // Generate a url that asks permissions for the Drive activity scope
      const authorizationUrl = this.oAuth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',
        /** Pass in the scopes array defined above.
         * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
        scope: scopes,
        // Enable incremental authorization. Recommended as a best practice.
        include_granted_scopes: true,
        // Include the state parameter to reduce the risk of CSRF attacks.
        // state: state,
        prompt: 'select_account',
      });
      return authorizationUrl;
    } catch (err) {
      this.logger.error(
        'Calling authorize()',
        err,
        GoogleClassroomService.name,
      );
      throw err;
    }
  }

  async getToken(code: string) {
    try {
      const token = await this.oAuth2Client.getToken(code);
      return token;
    } catch (err) {
      this.logger.error('Calling getToken()', err, GoogleClassroomService.name);
      throw err;
    }
  }
  //: Promise<GoogleClassroomInfoDto[]>
  async fetchClassroomData(user: User): Promise<GoogleClassroomInfoDto[]> {
    try {
      // Query for the user's access token
      if (user.googleRefreshToken == null) {
        throw new HttpException(
          'User has not authorize Google Classroom yet.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Get access token from refresh token
      await this.oAuth2Client.setCredentials({
        refresh_token: user.googleRefreshToken,
      });

      // Get the classroom data
      const classroom = google.classroom({
        version: 'v1',
        auth: this.oAuth2Client,
      });
      const response = await classroom.courses.list({
        pageSize: 100,
        teacherId: 'me',
      });
      return (
        response.data?.courses?.map((course) => {
          return {
            name: course.name,
            id: course.id,
            descriptionHeading: course.descriptionHeading,
            description: course.description,
            alternateLink: course.alternateLink,
            driveLink: course.teacherFolder
              ? course.teacherFolder.alternateLink
              : 'N/A',
          };
        }) ?? []
      );
    } catch (err) {
      this.logger.error(
        'Calling fetchClassroomData()',
        err,
        GoogleClassroomService.name,
      );
      throw err;
    }
  }

  async importClassroomData(
    user: User,
    classesInfo: ImportClassInfoDto[],
  ): Promise<boolean> {
    try {
      // Check if class has been imported
      const existingClasses = await this.classRepository.find({
        owner: user,
      });

      // TODO: add transaction

      // Excluded the class that has been imported
      classesInfo = classesInfo?.filter((classInfo) => {
        return !existingClasses
          ?.map((c) => c.googleCourseId)
          ?.includes(classInfo.id);
      });

      // Build class entity
      classesInfo?.map((classInfo) => {
        const entity = new Class();
        entity.id = randomUUID();
        entity.name = classInfo.name;
        entity.description = classInfo.description;
        entity.descriptionHeading = classInfo.descriptionHeading;
        entity.alternativeLink = classInfo.alternativeLink;
        entity.driveLink = classInfo.driveLink;
        entity.googleCourseId = classInfo.id;
        entity.owner = user;
        entity.color = generatePastelColor();
        this.classRepository.persist(entity);
      });

      // Import student
      await this.oAuth2Client.setCredentials({
        refresh_token: user.googleRefreshToken,
      });

      // fetch student
      const classroom = google.classroom({
        version: 'v1',
        auth: this.oAuth2Client,
      });

      const studentsResponse = await Promise.all(
        classesInfo?.map((classInfo) => {
          return classroom.courses.students.list({
            courseId: classInfo.id,
          });
        }),
      );

      const studentInfos = studentsResponse?.flatMap((studentResponse) => {
        return (
          studentResponse.data?.students?.map((student) => {
            return {
              email: student.profile.emailAddress,
              courseId: student.courseId,
              name: student.profile.name.fullName,
            };
          }) ?? []
        );
      });

      await Promise.all(
        studentInfos?.map(async (student) => {
          // check if the student is already in the database
          const existingUser = await this.userRepository.findOne(
            {
              email: student.email,
            },
            { populate: ['classes'] },
          );
          const classes = await existingUser.classes.loadItems();

          if (existingUser == null) {
            existingUser.id = randomUUID();
            existingUser.email = student.email;
            existingUser.role = Role.STUDENT;
            existingUser.name = student.name;
            this.userRepository.persist(existingUser);
          }

          // Check if the student is already in the class
          const existingClass = await this.classRepository.findOne({
            googleCourseId: student.courseId,
          });

          if (!classes.includes(existingClass)) {
            existingUser.classes.add(existingClass);
          }
        }),
      );

      // Import the classroom data
      await this.classRepository.flush();
      await this.userRepository.flush();

      // send invitation mail to each student
      studentInfos?.map(async (student) => {
        // send invitation mail to student
        // const mail = new Mail();
        // mail.to = student.email;
        // mail.subject = 'Invitation to join class';
        // mail.body = `You have been invited to join the class ${classInfo.name}`;
        // await this.mailService.sendMail(mail);
      });

      return true;
    } catch (err) {
      this.logger.error(
        'Calling importClassroomData()',
        err,
        GoogleClassroomService.name,
      );
      throw err;
    }
  }
}
