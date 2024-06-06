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
import { generatePastelColor } from 'src/common/utils/utils';
import { MailerService } from '@nest-modules/mailer';
import { OAuth2Client } from 'google-auth-library';
import { generatePhoto } from '../pexels/pexels.service';
import { Lesson } from 'src/entities/lesson.entity';
import { Readable } from 'stream';

@Injectable()
export class GoogleClassroomService {
  private readonly oAuth2Client: OAuth2Client;
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
        'https://www.googleapis.com/auth/drive',
      ];

      // Generate a secure random state value.
      // const state = crypto.randomBytes(16).toString('hex');

      // Generate a url that asks permissions for the Drive activity scope
      return this.oAuth2Client.generateAuthUrl({
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
      return await this.oAuth2Client.getToken(code);
    } catch (err) {
      this.logger.error('Calling getToken()', err, GoogleClassroomService.name);
      throw err;
    }
  }

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
      this.oAuth2Client.setCredentials({
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
      await Promise.all(
        classesInfo?.map(async (classInfo) => {
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
          entity.cover = await generatePhoto('zoom%20office%20backgrounds');
          this.classRepository.persist(entity);
        }),
      );

      // Import student
      this.oAuth2Client.setCredentials({
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

          let currentStudent;
          if (existingUser != null && existingUser?.id != null) {
            currentStudent = existingUser;
          } else {
            currentStudent = new User();
            currentStudent.id = randomUUID();
            currentStudent.email = student.email;
            currentStudent.role = Role.STUDENT;
            currentStudent.name = student.name;
            this.userRepository.persistAndFlush(currentStudent);
          }

          currentStudent = await this.userRepository.findOne(
            {
              email: student.email,
            },
            { populate: ['classes'] },
          );
          const classes = await currentStudent.classes.loadItems();

          // Check if the student is already in the class
          const existingClass = await this.classRepository.findOne({
            googleCourseId: student.courseId,
          });

          if (!classes.includes(existingClass)) {
            currentStudent.classes.add(existingClass);
          }
        }),
      );

      // Import the classroom data
      await this.classRepository.flush();
      await this.userRepository.flush();

      // send invitation mail to each student
      studentInfos?.map(async (student) => {
        const className =
          classesInfo?.find((c) => c.id == student.courseId)?.name ?? 'N/A';
        await this.mailerService
          .sendMail({
            to: student.email,
            subject: 'Invitation to join class',
            template: 'invite_student',
            context: {
              studentName: student.name,
              teacherName: user.name,
              joinLink: process.env.CLIENT_URL + '/login',
              className: className,
            },
          })
          .then(() => {
            this.logger.info(
              `Sent invitation mail to ${student.email} for class ${className}`,
            );
          });
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

  async uploadFileToDrive(user: User, file: Express.Multer.File) {
    try {
      this.oAuth2Client.setCredentials({
        refresh_token: user.googleRefreshToken,
      });

      const drive = google.drive({
        version: 'v3',
        auth: this.oAuth2Client,
      });

      const response = await drive.files.create({
        requestBody: {
          name: `${file.originalname}-${randomUUID()}`,
          mimeType: file.mimetype,
        },
        media: {
          mimeType: file.mimetype,
          body: Readable.from(file.buffer),
        },
      });

      return {
        id: response.data.id,
        title: response.data.name,
        link: response.data.webViewLink,
      };
    } catch (err) {
      this.logger.error(
        'Calling uploadFileToDrive()',
        err,
        GoogleClassroomService.name,
      );
      throw err;
    }
  }

  async shareLesson(
    user: User,
    lesson: Lesson,
    googleCourseId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    try {
      // Upload the file to Google Drive
      const driveFile = await this.uploadFileToDrive(user, file);

      // Share the file to Google Classroom
      this.oAuth2Client.setCredentials({
        refresh_token: user.googleRefreshToken,
      });

      const classroom = google.classroom({
        version: 'v1',
        auth: this.oAuth2Client,
      });

      const response = await classroom.courses.courseWorkMaterials.create({
        courseId: googleCourseId,
        requestBody: {
          title: lesson.name,
          description: lesson.description,
          materials: [
            {
              driveFile: {
                driveFile: {
                  id: driveFile.id,
                  title: driveFile.title,
                  alternateLink: driveFile.link,
                },
              },
            },
          ],
        },
      });

      return response.data.alternateLink;
    } catch (err) {
      this.logger.error(
        'Calling shareLesson()',
        err,
        GoogleClassroomService.name,
      );
      throw err;
    }
  }
}
