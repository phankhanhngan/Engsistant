import {
  Controller,
  Inject,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponseStatus, LessonStatus } from 'src/common/enum/common.enum';
import { CanvaService } from './canva.service';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Class } from '../../entities/class.entity';
import { EntityRepository } from '@mikro-orm/core';
import { LessonService } from '../lesson/lesson.service';

@Controller('canva')
@ApiTags('canva')
export class CanvaController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly canvaService: CanvaService,
    @InjectRepository(Class)
    private readonly classRepository: EntityRepository<Class>,
    private readonly lessonService: LessonService,
  ) {}

  @Post('/get-user')
  @ApiResponse({
    status: 200,
    description: `Get user by canva token`,
  })
  async checkConnect(@Req() req, @Res() res) {
    try {
      const { token: canvaToken } = req.body;
      const user = await this.canvaService.decodeToken(canvaToken);
      if (!user) {
        return res.status(200).json({
          message: 'Get user by canva token successfully',
          status: ApiResponseStatus.SUCCESS,
          user: null,
        });
      }
      return res.status(200).json({
        message: 'Get user by canva token successfully',
        status: ApiResponseStatus.SUCCESS,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          photo: user.photo,
        },
      });
    } catch (error) {
      this.logger.error('Calling checkConnect()', error, CanvaController.name);
      throw error;
    }
  }

  @Post('/classes')
  @ApiResponse({
    status: 200,
    description: `List all classes of current canva user. If the user has not authorized, it will return an empty array`,
  })
  async listClassroom(@Req() req, @Res() res) {
    try {
      const { token: canvaToken } = req.body;
      const user = await this.canvaService.decodeToken(canvaToken);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const classrooms = await this.classRepository.find({
        owner: user,
      });

      return res.status(200).json({
        message: 'List all classes successfully',
        status: ApiResponseStatus.SUCCESS,
        classes: classrooms,
      });
    } catch (error) {
      this.logger.error('Calling listClassroom()', error, CanvaController.name);
      throw error;
    }
  }

  @Post('/lessons/:classId')
  @ApiResponse({
    status: 200,
    description: `List all lessons in class of current canva user. If the user has not authorized, it will return an empty array`,
  })
  async listLessons(@Req() req, @Res() res, @Param('classId') classId: string) {
    try {
      const { token: canvaToken } = req.body;
      const user = await this.canvaService.decodeToken(canvaToken);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const classroom = await this.classRepository.findOneOrFail({
        id: classId,
        owner: user,
      });
      const lessons = await classroom.lessons.loadItems();

      const lessonsMap = await Promise.all(
        lessons
          .filter((l) => l.status === LessonStatus.READY)
          .map(async (l) => {
            const { class: clazz, ...others } =
              await this.lessonService.getLesson(l.id, user);
            return others;
          }),
      );

      return res.status(200).json({
        message: 'List all classes successfully',
        status: ApiResponseStatus.SUCCESS,
        lessons: lessonsMap,
      });
    } catch (error) {
      this.logger.error('Calling listLessons()', error, CanvaController.name);
      throw error;
    }
  }

  @Post('/lesson/:lessonId')
  @ApiResponse({
    status: 200,
    description: `Get lesson content`,
  })
  async getLessonContent(
    @Req() req,
    @Res() res,
    @Param('lessonId') classId: string,
  ) {
    try {
      const { token: canvaToken } = req.body;
      const user = await this.canvaService.decodeToken(canvaToken);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const lesson = await this.lessonService.getLesson(classId, user);
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }
      return res.status(200).json({
        message: 'List all classes successfully',
        status: ApiResponseStatus.SUCCESS,
        lesson: lesson,
      });
    } catch (error) {
      this.logger.error(
        'Calling getLessonContent()',
        error,
        CanvaController.name,
      );
      throw error;
    }
  }
}
