import { EntityRepository } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { User } from 'src/entities';
import * as bcrypt from 'bcrypt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { GoogleClassroomService } from '../google_classroom/google-classroom.service';
import { UserRtnDto } from '../auth/dtos/UserRtnDto.dto';
import { Class } from 'src/entities/class.entity';
import { ClassRtnDto } from './dtos/ClassRtn.dto';
import { Role } from '../../common/enum/common.enum';

@Injectable()
export class UsersService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(Class)
    private readonly classRepository: EntityRepository<Class>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly googleService: GoogleClassroomService,
  ) {}

  async hashPassword(password: string) {
    try {
      const saltRounds = 10; // Số lần lặp để tạo salt, thay đổi tùy ý
      return bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw error;
    }
  }

  async duplicatedEmail(email: string) {
    try {
      const count = await this.em.count('User', { email: email });
      if (count < 1) return false;
      return true;
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ email: email });
      if (!user) return null;
      return user;
    } catch (error) {
      this.logger.error('Calling getUserByEmail()', error, UsersService.name);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ id: id });
      if (!user)
        throw new NotFoundException(`Can not find user with id: ${id}`);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserByGoogleId(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ authId: id });
      if (!user) return null;
      return user;
    } catch (error) {
      this.logger.error(
        'Calling getUserByGoogleId()',
        error,
        UsersService.name,
      );
      throw error;
    }
  }

  async setGoogleToken(user: User, code: string): Promise<boolean> {
    try {
      // Get the access token
      const { tokens } = await this.googleService.getToken(code);
      const refreshToken = tokens.refresh_token;
      if (!refreshToken) return false;

      // Save the refresh token
      user.googleRefreshToken = refreshToken;
      await this.userRepository.persistAndFlush(user);
      return true;
    } catch (error) {
      this.logger.error('Calling setGoogleToken()', error, UsersService.name);
      throw error;
    }
  }

  async updateUser(
    id: string,
    name?: string | null,
    image?: string | null,
    role?: Role | null,
  ): Promise<UserRtnDto> {
    try {
      const user = await this.getUserById(id);
      if (!user)
        throw new NotFoundException(`Can not find user with id: ${id}`);

      if (image) user.photo = image;
      if (name) user.name = name;
      if (role) user.role = role;

      await this.userRepository.persistAndFlush(user);
      return user;
    } catch (error) {
      this.logger.error('Calling updateUser()', error, UsersService.name);
      throw error;
    }
  }

  async listUsers(role: Role | null, search: string | null) {
    try {
      const filter = {};
      if (role) filter['role'] = role;
      if (search) filter['name'] = { $like: `%${search}%` };

      const users = await this.userRepository.findAll({ ...filter });
      return await Promise.all(
        users?.map(async (user) => {
          let numberOfClasses = null;
          let numberOfLessons = null;

          if (user.role === Role.TEACHER) {
            // count classes
            const classes = await this.classRepository.find({ owner: user });
            // count students
            console.log(classes);
            numberOfClasses = classes.length;
            // count lessons
            numberOfLessons = classes
              .map((c) => c.lessons.loadItems())
              .flat().length;
          }
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            photo: user.photo,
            role: user.role,
            numberOfClasses: numberOfClasses,
            numberOfLessons: numberOfLessons,
          };
        }) ?? [],
      );
    } catch (error) {
      this.logger.error('Calling listUsers()', error, UsersService.name);
      throw error;
    }
  }

  async listClasses(user: User, search: string | null): Promise<ClassRtnDto[]> {
    try {
      let classes = await user.classes.loadItems();
      if (search) {
        classes = classes.filter((c) => c.name.includes(search));
      }
      return (
        (await Promise.all(
          classes?.map(async (c) => {
            const students = await this.userRepository.find(
              {
                classes: c,
                role: Role.STUDENT,
              },
              { fields: ['id', 'name', 'email', 'photo'] },
            );
            const lessons = await c.lessons.loadItems();

            const classRtnDto = new ClassRtnDto();
            classRtnDto.id = c.id;
            classRtnDto.name = c.name;
            classRtnDto.students = students;
            classRtnDto.description = c.description;
            classRtnDto.descriptionHeading = c.descriptionHeading;
            classRtnDto.alternativeLink = c.alternativeLink;
            classRtnDto.color = c.color;
            classRtnDto.driveLink = c.driveLink;
            classRtnDto.googleCourseId = c.googleCourseId;
            classRtnDto.lessons = lessons.map((l) => ({
              id: l.id,
              name: l.name,
              description: l.description,
              cover: l.cover,
            }));
            classRtnDto.cover = c.cover;
            return classRtnDto;
          }),
        )) ?? []
      );
    } catch (error) {
      this.logger.error('Calling listClasses()', error, UsersService.name);
      throw error;
    }
  }
}
