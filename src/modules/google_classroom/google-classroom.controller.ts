import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
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
import { ApiResponse } from '@nestjs/swagger';
import { ApiResponseStatus, Role } from 'src/common/enum/common.enum';
import { AuthorizeTypeDto } from './swagger_types/Authorize.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ListClassDTO } from './swagger_types/ListClass.dto';
import { ImportClassDto } from './dtos/ImportClass.dto';
import { RoleAuthGuard } from 'src/common/guards/role-auth.guard';

@Controller('google/classes')
@UseGuards(JwtAuthGuard)
export class GoogleClassroomController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly googleClassroomService: GoogleClassroomService,
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
      res.status(500).json({
        message: `authorize failed due to error=${error.message} ${error.stack}`,
        status: ApiResponseStatus.FAILURE,
      });
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
      res.status(500).json({
        message: `listClassroom failed due to error=${error.message} ${error.stack}`,
        status: ApiResponseStatus.FAILURE,
      });
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
      res.status(500).json({
        message: `Import classes failed due to error=${error.message} ${error.stack}`,
        status: ApiResponseStatus.FAILURE,
      });
    }
  }
}
