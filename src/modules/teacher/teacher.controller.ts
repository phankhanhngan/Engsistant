import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
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
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClassRtnDto } from '../users/dtos/ClassRtn.dto';
import { GptService } from '../gpt/gpt.service';
import { ListWordsDto } from './dtos/ListWord.dto';
import { LessonService } from '../lesson/lesson.service';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Class } from 'src/entities/class.entity';
import { EntityRepository } from '@mikro-orm/core';
import {
  BaseSwaggerResponseDto,
  BuildLessonResponseDto,
  GetLessonResponse,
  LessonRecommendSwaggerDto,
  ListLessonResponse,
  UpdateGrammarResponse,
  UpdateVocabularyResponse,
} from 'src/common/swagger_types/swagger-type.dto';
import { BuildLessonRequestDto } from '../lesson/dtos/BuildLessonRequest.dto';
import { grammars, vocabularies } from 'src/common/constants/mock';
import { separateSentences } from '../../common/utils/utils';
import { Lesson } from '../../entities/lesson.entity';
import { UpdateVocabularyDto } from './dtos/UpdateVocabulary.dto';
import { UpdateGrammarDto } from './dtos/UpdateGrammar.dto';
import { DeleteVocabularyDto } from './dtos/DeleteVocabulary.dto';
import { DeleteGrammarDto } from './dtos/DeleteGrammar.dto';
import { MailerService } from '@nest-modules/mailer';
import { fileFilter } from '../users/helpers/file-filter.helper';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CEFR } from '../../common/constants/cefr-level';

@Controller('teacher')
@ApiTags('teacher')
@UseGuards(JwtAuthGuard)
export class TeacherController {
  constructor(
    private readonly teacherService: TeacherService,
    private readonly lessonService: LessonService,
    private readonly gptService: GptService,
    @InjectRepository(Class)
    private readonly classRepository: EntityRepository<Class>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly mailerService: MailerService,
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
  async listClasses(
    @Req() req,
    @Res() res,
    @Query('search') search: string | null,
  ) {
    try {
      const user = req.user;
      const classes = await this.teacherService.listClasses(user, search);
      res.status(200).json({
        message: 'List all classes successfully',
        status: ApiResponseStatus.SUCCESS,
        classes: classes,
      });
    } catch (error) {
      this.logger.error('Calling listClasses()', error, TeacherController.name);
      throw error;
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
      const { paragraph, level, mock } = body;
      if (mock) {
        return res.status(200).json({
          message: 'List all highlighted words and grammar level successfully',
          status: ApiResponseStatus.SUCCESS,
          vocabularies: vocabularies,
          grammars: grammars,
        });
      }
      const sentences = separateSentences(paragraph);
      if (sentences.length == 0) {
        res.status(400).json({
          message: 'Paragraph must have at least 1 sentence',
          status: ApiResponseStatus.FAILURE,
        });
      }
      const recommendVocabularies = await this.gptService.getHighlightedWords(
        paragraph,
        level,
      );
      const recommendGrammars = await this.gptService.getGrammarsFromSentences(
        sentences,
        level,
      );
      res.status(200).json({
        message: 'List all highlighted words and grammar level successfully',
        status: ApiResponseStatus.SUCCESS,
        vocabularies: recommendVocabularies,
        grammars: recommendGrammars.filter(
          (grammar) => grammar.grammars.length > 0,
        ),
      });
    } catch (error) {
      this.logger.error(
        'Calling listWordsFromParagraph()',
        error,
        TeacherController.name,
      );
      throw error;
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
      const {
        grammars,
        vocabularies,
        level,
        classId,
        name,
        description,
        paragraph,
      } = body;
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

      if (body.mock === true) {
        this.lessonService
          .buildMockLesson(classId, level, name, description, paragraph)
          .then(async (lesson: Lesson) => {
            // update lesson status
            await this.lessonService.updateLessonStatus(
              lesson.id,
              LessonStatus.READY,
            );
            await this.mailerService
              .sendMail({
                to: user.email,
                subject: 'Lesson is ready',
                template: 'lesson_ready',
                context: {
                  teacherName: user.name,
                  lessonName: `${lesson.name} mock`,
                  className: clazz.name,
                  lessonLink:
                    process.env.CLIENT_URL + '/my-lesson/' + lesson.id,
                },
              })
              .then(() => {
                console.log(
                  `Sent email to teacher ${user.email} for lesson ${lesson.id}`,
                );
              });
            console.log('build mock lesson done');
          });
        return res.status(200).json({
          message:
            'Request to build lesson successfully. Wait for it to be processed.',
          status: ApiResponseStatus.SUCCESS,
          lesson: {
            status: LessonStatus.PENDING,
          },
        });
      }

      this.lessonService
        .buildLesson(
          classId,
          level,
          vocabularies,
          grammars,
          name,
          description,
          paragraph,
        )
        .then(async (lesson: Lesson) => {
          // update lesson status
          await this.lessonService.updateLessonStatus(
            lesson.id,
            LessonStatus.READY,
          );
          await this.mailerService
            .sendMail({
              to: user.email,
              subject: 'Lesson is ready',
              template: 'lesson_ready',
              context: {
                teacherName: user.name,
                lessonName: lesson.name,
                className: clazz.name,
                lessonLink: process.env.CLIENT_URL + '/my-lesson/' + lesson.id,
              },
            })
            .then(() => {
              console.log(
                `Sent email to teacher ${user.email} for lesson ${lesson.id}`,
              );
            });
          console.log('build lesson done');
        });

      res.status(200).json({
        message:
          'Request to build lesson successfully. Wait for it to be processed.',
        status: ApiResponseStatus.SUCCESS,
        lesson: {
          status: LessonStatus.PENDING,
        },
      });
    } catch (error) {
      this.logger.error('Calling buildLesson()', error, TeacherController.name);
      throw error;
    }
  }

  @Get('/lessons/:id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({
    status: 200,
    type: GetLessonResponse,
    description: `Get lessons by id.`,
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
      this.logger.error('Calling getLesson()', error, TeacherController.name);
      throw error;
    }
  }

  @Post('/lessons/:id/share')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({
    status: 200,
    type: BaseSwaggerResponseDto,
    description: `Share lesson file to Google classroom as material.`,
  })
  @UseGuards(RoleAuthGuard([Role.TEACHER]))
  @UseInterceptors(FilesInterceptor('file', 1, fileFilter))
  async shareLesson(
    @Req() req,
    @Res() res,
    @Param('id') lessonId: string,
    @UploadedFiles(new ParseFilePipe({}))
    files: Array<Express.Multer.File>,
  ) {
    try {
      const user = req.user;
      if (files.length !== 1) {
        throw new BadRequestException('Only one file is allowed');
      }
      const file = files[0];
      if (!file) {
        throw new BadRequestException('No file found');
      }
      await this.lessonService.shareLesson(user, lessonId, file);

      res.status(200).json({
        message: 'Lesson shared successfully.',
        status: ApiResponseStatus.SUCCESS,
      });
    } catch (error) {
      this.logger.error('Calling shareLesson()', error, TeacherController.name);
      throw error;
    }
  }

  @Get('/lessons/list/:classId')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({
    status: 200,
    type: ListLessonResponse,
    description: `List lessons by class id.`,
  })
  @UseGuards(RoleAuthGuard([Role.TEACHER]))
  async listLessons(
    @Req() req,
    @Res() res,
    @Param('classId') classId: string,
    @Query('level') level: CEFR | 'ALL',
    @Query('search') search: string | null,
    @Query('status') status: LessonStatus | 'ALL',
  ) {
    try {
      const user = req.user;
      const lessons = await this.lessonService.listLessons(
        classId,
        user,
        level,
        search,
        status,
      );
      res.status(200).json({
        message: 'List lesson successfully.',
        status: ApiResponseStatus.SUCCESS,
        lessons: lessons,
      });
    } catch (error) {
      this.logger.error('Calling buildLesson()', error, TeacherController.name);
      throw error;
    }
  }

  @Put('/lessons/vocabularies/update')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({
    status: 200,
    type: UpdateVocabularyResponse,
    description: `Update vocabulary.`,
  })
  @UseGuards(RoleAuthGuard([Role.TEACHER]))
  async updateVocabulary(
    @Req() req,
    @Res() res,
    @Body() body: UpdateVocabularyDto,
  ) {
    try {
      const user = req.user;
      const { id, meaning, examples, antonyms, synonyms } = body;
      const updatedVocabulary = await this.lessonService.updateVocabulary(
        user,
        id,
        meaning,
        examples,
        antonyms,
        synonyms,
      );
      res.status(200).json({
        message: 'Update vocabulary successfully.',
        status: ApiResponseStatus.SUCCESS,
        vocabulary: updatedVocabulary,
      });
    } catch (error) {
      this.logger.error(
        'Calling updateVocabulary()',
        error,
        TeacherController.name,
      );
      throw error;
    }
  }

  @Put('/lessons/vocabularies/delete')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({
    status: 200,
    type: BaseSwaggerResponseDto,
    description: `Update vocabulary.`,
  })
  @UseGuards(RoleAuthGuard([Role.TEACHER]))
  async deleteVocabulary(
    @Req() req,
    @Res() res,
    @Body() body: DeleteVocabularyDto,
  ) {
    try {
      const user = req.user;
      const { id } = body;
      await this.lessonService.deleteVocabulary(user, id);
      res.status(200).json({
        message: 'Delete vocabulary successfully.',
        status: ApiResponseStatus.SUCCESS,
      });
    } catch (error) {
      this.logger.error(
        'Calling deleteVocabulary()',
        error,
        TeacherController.name,
      );
      throw error;
    }
  }

  @Put('/lessons/grammars/update')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({
    status: 200,
    type: UpdateGrammarResponse,
    description: `Update vocabulary.`,
  })
  @UseGuards(RoleAuthGuard([Role.TEACHER]))
  async updateGrammar(@Req() req, @Res() res, @Body() body: UpdateGrammarDto) {
    try {
      const user = req.user;
      const { id, usage, examples } = body;
      const updatedGrammar = await this.lessonService.updateGrammar(
        user,
        id,
        usage,
        examples,
      );
      res.status(200).json({
        message: 'Update grammar successfully.',
        status: ApiResponseStatus.SUCCESS,
        grammar: updatedGrammar,
      });
    } catch (error) {
      this.logger.error(
        'Calling updateGrammar()',
        error,
        TeacherController.name,
      );
      throw error;
    }
  }

  @Put('/lessons/grammars/delete')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({
    status: 200,
    type: BaseSwaggerResponseDto,
    description: `Update vocabulary.`,
  })
  @UseGuards(RoleAuthGuard([Role.TEACHER]))
  async deleteGrammar(@Req() req, @Res() res, @Body() body: DeleteGrammarDto) {
    try {
      const user = req.user;
      const { id } = body;
      await this.lessonService.deleteGrammar(user, id);
      res.status(200).json({
        message: 'Delete grammar successfully.',
        status: ApiResponseStatus.SUCCESS,
      });
    } catch (error) {
      this.logger.error(
        'Calling deleteGrammar()',
        error,
        TeacherController.name,
      );
      throw error;
    }
  }
}
