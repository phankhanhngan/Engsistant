import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Logger } from 'winston';
import { Response } from 'express';
import { GoogleClassroomService } from './google-classroom.service';
import { AuthorizeDto } from './dtos/Authorize.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('classes')
// @UseGuards(JwtAuthGuard)
// Userole guard
export class GoogleClassroomController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly googleClassroomService: GoogleClassroomService,
  ) {}

  @Post('/authorize')
  // @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async authorize(
    @Req() req,
    @Res() res: Response,
    // @Body() body: AuthorizeDto,
  ) {
    try {
      await this.googleClassroomService.authorize();
      res.status(200).json({ message: 'Authorized' });
    } catch (error) {
      this.logger.error(
        'Calling authorize()',
        error,
        GoogleClassroomController.name,
      );
      throw error;
    }
  }

  @Get('/list')
  async listClassroom(@Req() req, @Res() res: Response) {
    try {
      const classrooms = await this.googleClassroomService.fetchClassroomData();
      res.json({ received: true });
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
