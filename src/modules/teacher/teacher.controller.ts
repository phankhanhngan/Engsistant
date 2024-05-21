import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {
  ApiResponseStatus,
  LessonStatus,
  Role,
} from 'src/common/enum/common.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleAuthGuard } from 'src/common/guards/role-auth.guard';
import { TeacherService } from './teacher.service';
import { ApiResponse } from '@nestjs/swagger';
import { ClassRtnDto } from '../users/dtos/ClassRtn.dto';
import { GptService } from '../gpt/gpt.service';
import { ListWordsDto } from './dtos/ListWord.dto';
import { LessonService } from '../lesson/lesson.service';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Class } from 'src/entities/class.entity';
import { EntityRepository } from '@mikro-orm/core';
import {
  BuildLessonResponseDto,
  GetLessonResponse,
  LessonRecommendSwaggerDto,
  ListLessonResponse,
} from 'src/common/swagger_types/swagger-type.dto';
import { BuildLessonRequestDto } from '../lesson/dtos/BuildLessonRequest.dto';

@Controller('teacher')
@UseGuards(JwtAuthGuard)
export class TeacherController {
  constructor(
    private readonly teacherService: TeacherService,
    private readonly lessonService: LessonService,
    private readonly gptService: GptService,
    @InjectRepository(Class)
    private readonly classRepository: EntityRepository<Class>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get('/classes')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({
    status: 200,
    type: ClassRtnDto,
    description: `List all imported classes of teacher.`,
  })
  @UseGuards(RoleAuthGuard([Role.TEACHER]))
  async listClasses(@Req() req, @Res() res) {
    try {
      const user = req.user;
      const classes = await this.teacherService.listClasses(user);
      res.status(200).json({
        message: 'List all classes successfully',
        status: ApiResponseStatus.SUCCESS,
        classes: classes,
      });
    } catch (error) {
      this.logger.error('Calling listClasses()', error, TeacherController.name);
      res.status(500).json({
        message: 'Failed to list classes due to error= ' + error.message,
        status: ApiResponseStatus.FAILURE,
      });
    }
  }

  // Get highlighted words from paragraph
  @Post('/lessons/recommend')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({
    status: 200,
    type: LessonRecommendSwaggerDto,
    description: `List all words from GPT and grammars by sentences that are equals or 1 level higher than inputted level.`,
  })
  @UseGuards(RoleAuthGuard([Role.TEACHER]))
  async listGptWordsFromParagraph(
    @Req() req,
    @Res() res,
    @Body() body: ListWordsDto,
  ) {
    try {
      const { paragraph, level } = body;
      const sentences = paragraph.match(/[^\.!\?]+[\.!\?]+/g);
      if (sentences.length == 0) {
        res.status(400).json({
          message: 'Paragraph must have at least 1 sentence',
          status: ApiResponseStatus.FAILURE,
        });
      }
      const vocabularies = await this.gptService.getHighlightedWords(
        paragraph,
        level,
      );
      const grammars = await this.gptService.getGrammarsFromSentences(
        sentences,
        level,
      );
      res.status(200).json({
        message: 'List all highlighted words and grammar level successfully',
        status: ApiResponseStatus.SUCCESS,
        vocabularies: vocabularies,
        grammars: grammars,
      });
    } catch (error) {
      this.logger.error(
        'Calling listWordsFromParagraph()',
        error,
        TeacherController.name,
      );
      res.status(500).json({
        message:
          'Failed to list highlight word from gpt due to error= ' +
          error.message,
        status: ApiResponseStatus.FAILURE,
      });
    }
  }

  @Post('/lessons/build')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({
    status: 200,
    type: BuildLessonResponseDto,
    description: `Gen words from all highlighted word in lession builder.`,
  })
  @UseGuards(RoleAuthGuard([Role.TEACHER]))
  async buildLesson(
    @Req() req,
    @Res() res,
    @Body()
    body: BuildLessonRequestDto,
  ) {
    try {
      const { grammars, vocabularies, level, classId, name, description } =
        body;
      // see if class belongs to teacher
      const user = req.user;
      const clazz = await this.classRepository.findOne({
        owner: user,
        id: classId,
      });
      if (!clazz) {
        res.status(404).json({
          message: 'Class not found.',
          status: ApiResponseStatus.FAILURE,
        });
        return;
      }

      this.lessonService.buildLesson(
        classId,
        level,
        vocabularies,
        grammars,
        name,
        description,
      );
      res.status(200).json({
        message:
          'Request to build lesson susscessfully. Wait for it to be processed.',
        status: ApiResponseStatus.SUCCESS,
        lesson: {
          status: LessonStatus.PENDING,
        },
      });
    } catch (error) {
      this.logger.error('Calling buildLesson()', error, TeacherController.name);
      res.status(500).json({
        message: 'Failed to build lesson due to error= ' + error.message,
        status: ApiResponseStatus.FAILURE,
      });
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
  @UseGuards(RoleAuthGuard([Role.TEACHER]))
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
      this.logger.error('Calling buildLesson()', error, TeacherController.name);
      res.status(500).json({
        message: 'Failed to build lesson due to error= ' + error.message,
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
  @UseGuards(RoleAuthGuard([Role.TEACHER]))
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
      this.logger.error('Calling buildLesson()', error, TeacherController.name);
      res.status(500).json({
        message: 'Failed to build lesson due to error= ' + error.message,
        status: ApiResponseStatus.FAILURE,
      });
    }
  }
}
