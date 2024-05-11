import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { User } from 'src/entities';
import { Class } from 'src/entities/class.entity';
import { ClassRtnDto } from '../users/dtos/ClassRtn.dto';
import { Role } from 'src/common/enum/common.enum';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: EntityRepository<Class>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async listClasses(user: User): Promise<ClassRtnDto[]> {
    try {
      const classes = await this.classRepository.find({ owner: user });
      const students = await this.userRepository.find(
        {
          classes: { $in: classes },
          role: Role.STUDENT,
        },
        { fields: ['id', 'name', 'email', 'photo'] },
      );
      const classesMap =
        classes?.map((c) => {
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
          return classRtnDto;
        }) ?? [];

      return classesMap;
    } catch (error) {
      this.logger.error('Calling listClasses()', error, TeacherService.name);
      throw error;
    }
  }
}
