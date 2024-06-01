import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ApiResponseStatus, Role } from 'src/common/enum/common.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleAuthGuard } from 'src/common/guards/role-auth.guard';
import { UsersService } from '../users/users.service';
import { ApiResponse } from '@nestjs/swagger';
import { ClassRtnDto } from '../users/dtos/ClassRtn.dto';
import {
  GetLessonResponse,
  ListLessonResponse,
} from 'src/common/swagger_types/swagger-type.dto';
import { LessonService } from '../lesson/lesson.service';

@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly lessonService: LessonService,
  ) {}

  @ApiResponse({
    status: 200,
    type: ClassRtnDto,
    description: `List all classes of student.`,
  })
  @Get('/my-classes')
  @UseGuards(RoleAuthGuard([Role.STUDENT]))
  async listClasses(@Res() res, @Req() req) {
    try {
      const user = await this.usersService.getUserByEmail(req.user.email);
      const classes = await this.usersService.listClasses(user);
      return res.status(200).json({
        message: 'Get my classes successfully',
        status: ApiResponseStatus.SUCCESS,
        classes: classes,
      });
    } catch (error) {
      this.logger.error(
        'Calling getCurrentUserInfo()',
        error,
        StudentController.name,
      );
      throw error;
    }
  }

  @Get('/lessons/:id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({
    status: 200,
    type: GetLessonResponse,
    description: `Get lessons.`,
  })
  @UseGuards(RoleAuthGuard([Role.STUDENT]))
  async getLesson(@Req() req, @Res() res, @Param('id') lessonId: string) {
    try {
      const user = req.user;

      const lesson = await this.lessonService.getLesson(lessonId, user);
      res.status(200).json({
        message: 'Get lesson successfully',
        status: ApiResponseStatus.SUCCESS,
        lesson: lesson,
      });
    } catch (error) {
      this.logger.error('Calling getLesson()', error, StudentController.name);
      res.status(500).json({
        message: 'Failed to get lesson due to error= ' + error.message,
        status: ApiResponseStatus.FAILURE,
      });
    }
  }

  @Get('/lessons/list/:classId')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({
    status: 200,
    type: ListLessonResponse,
    description: `List lessons.`,
  })
  @UseGuards(RoleAuthGuard([Role.STUDENT]))
  async listLessons(@Req() req, @Res() res, @Param('classId') classId: string) {
    try {
      const user = req.user;
      const lessons = await this.lessonService.listLessons(classId, user);
      res.status(200).json({
        message: 'List lesson successfully.',
        status: ApiResponseStatus.SUCCESS,
        lessons: lessons,
      });
    } catch (error) {
      this.logger.error('Calling listLessons()', error, StudentController.name);
      res.status(500).json({
        message: 'Failed to list lessons due to error= ' + error.message,
        status: ApiResponseStatus.FAILURE,
      });
    }
  }
}
