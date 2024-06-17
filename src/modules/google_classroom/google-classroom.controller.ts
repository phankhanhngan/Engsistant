import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Response } from 'express';
import { GoogleClassroomService } from './google-classroom.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponseStatus, Role } from 'src/common/enum/common.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ImportClassDto } from './dtos/ImportClass.dto';
import { RoleAuthGuard } from 'src/common/guards/role-auth.guard';
import {
  AuthorizeTypeDto,
  ListClassDTO,
} from 'src/common/swagger_types/swagger-type.dto';
import { EntityRepository } from '@mikro-orm/mysql';
import { Class } from 'src/entities/class.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User } from 'src/entities';

@Controller('google/classes')
@ApiTags('google/classes')
@UseGuards(JwtAuthGuard)
export class GoogleClassroomController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly googleClassroomService: GoogleClassroomService,
    @InjectRepository(Class)
    private readonly classRepository: EntityRepository<Class>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  @Post('/authorize')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({
    status: 200,
    type: AuthorizeTypeDto,
    description: `Get the authorize url that redirects to Google classroom authorization page.`,
  })
  @UseGuards(RoleAuthGuard([Role.TEACHER]))
  async authorize(@Req() req, @Res() res: Response) {
    try {
      const user = req.user;
      let isAuthorized = true;
      let authorizeUrl = '';
      if (user.googleRefreshToken == null) {
        isAuthorized = false;
        authorizeUrl = await this.googleClassroomService.authorize();
      }
      res.status(200).json({
        message: 'Get the authorization URL successfully',
        status: ApiResponseStatus.SUCCESS,
        isAuthorized: isAuthorized,
        authorizeUrl: authorizeUrl,
      });
    } catch (error) {
      this.logger.error(
        'Calling authorize()',
        error,
        GoogleClassroomController.name,
      );
      throw error;
    }
  }

  @Get('/list-all')
  @ApiResponse({
    status: 200,
    type: ListClassDTO,
    description: `List all classes of current user. If the user has not authorized, it will return an empty array`,
  })
  @UseGuards(RoleAuthGuard([Role.TEACHER]))
  async listClassroom(@Req() req, @Res() res: Response) {
    try {
      const user = req.user;
      const classrooms = await this.googleClassroomService.fetchClassroomData(
        user,
      );
      res.status(200).json({
        message: 'List all classes successfully',
        status: ApiResponseStatus.SUCCESS,
        classes: classrooms,
      });
    } catch (error) {
      this.logger.error(
        'Calling listClassroom()',
        error,
        GoogleClassroomController.name,
      );
      throw error;
    }
  }

  @Post('/:classId/sync-students')
  @ApiResponse({
    status: 200,
    description: `Sync students of specific class.`,
  })
  @UseGuards(RoleAuthGuard([Role.TEACHER]))
  async syncStudents(
    @Req() req,
    @Res() res: Response,
    @Param('classId') classId: string,
  ) {
    try {
      const user = req.user;
      const clazz = await this.classRepository.findOne({
        id: classId,
        owner: user,
      });
      if (!clazz) {
        res.status(400).json({
          message: 'Class not found',
          status: ApiResponseStatus.FAILURE,
        });
      }

      await this.googleClassroomService.syncStudents(user, clazz);

      const updatedListStudents = await this.userRepository.find(
        {
          classes: clazz,
          role: Role.STUDENT,
        },
        { fields: ['id', 'name', 'email', 'photo'] },
      );

      res.status(200).json({
        message: 'Sync students successfully',
        status: ApiResponseStatus.SUCCESS,
        students: updatedListStudents.map((el) => {
          const { classes, googleRefreshToken, authId, ...rest } = el;
          return rest;
        }),
      });
    } catch (error) {
      this.logger.error(
        'Calling listClassroom()',
        error,
        GoogleClassroomController.name,
      );
      throw error;
    }
  }

  @Post('/import')
  @ApiResponse({
    status: 200,
    type: ListClassDTO,
    description: `List all classes of current user. If the user has not authorized, it will return an empty array`,
  })
  @UseGuards(RoleAuthGuard([Role.TEACHER]))
  async importClassroom(
    @Req() req,
    @Res() res: Response,
    @Body() importClassDto: ImportClassDto,
  ) {
    try {
      const user = req.user;
      // Import the class
      const success = await this.googleClassroomService.importClassroomData(
        user,
        importClassDto.classes,
      );

      if (success) {
        res.status(200).json({
          message: 'Import classes successfully',
          status: ApiResponseStatus.SUCCESS,
        });
      } else {
        res.status(400).json({
          message: 'Import classes failed',
          status: ApiResponseStatus.FAILURE,
        });
      }
    } catch (error) {
      this.logger.error(
        'Calling listClassroom()',
        error,
        GoogleClassroomController.name,
      );
      throw error;
    }
  }
}
