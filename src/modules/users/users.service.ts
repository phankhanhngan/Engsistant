import { EntityRepository } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { User } from 'src/entities';
import * as bcrypt from 'bcrypt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { GoogleClassroomService } from '../google_classroom/google-classroom.service';
import { UpdateUserDto } from '../admin/dtos/UpdateUser.dto';
import { plainToClass } from 'class-transformer';
import { UserRtnDto } from '../auth/dtos/UserRtnDto.dto';
import { Class } from 'src/entities/class.entity';
import { ClassRtnDto } from './dtos/ClassRtn.dto';

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

  async updateUser(id: string, updateDto: UpdateUserDto): Promise<UserRtnDto> {
    try {
      const user = await this.getUserById(id);
      if (!user)
        throw new NotFoundException(`Can not find user with id: ${id}`);

      if (updateDto.role) user.role = updateDto.role;
      if (updateDto.googleRefreshToken)
        user.googleRefreshToken = updateDto.googleRefreshToken;
      if (updateDto.name) user.name = updateDto.name;
      if (updateDto.authId) user.authId = updateDto.authId;
      await this.userRepository.persistAndFlush(user);

      return plainToClass(UserRtnDto, user);
    } catch (error) {
      this.logger.error('Calling updateUser()', error, UsersService.name);
      throw error;
    }
  }

  async listUsers(): Promise<UserRtnDto[]> {
    try {
      const users = await this.userRepository.findAll();
      return (
        users?.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          photo: user.photo,
          created_at: user.created_at,
          updated_at: user.updated_at,
          googleId: user.authId,
        })) ?? []
      );
    } catch (error) {
      this.logger.error('Calling listUsers()', error, UsersService.name);
      throw error;
    }
  }

  async listClasses(user: User): Promise<ClassRtnDto[]> {
    try {
      const classes = await user.classes.loadItems();
      return (
        classes?.map((cls) => ({
          id: cls.id,
          name: cls.name,
          description: cls.description,
          descriptionHeading: cls.descriptionHeading,
          alternativeLink: cls.alternativeLink,
          driveLink: cls.driveLink,
          googleCourseId: cls.googleCourseId,
          color: cls.color,
          cover: cls.cover,
        })) ?? []
      );
    } catch (error) {
      this.logger.error('Calling listClasses()', error, UsersService.name);
      throw error;
    }
  }
}
