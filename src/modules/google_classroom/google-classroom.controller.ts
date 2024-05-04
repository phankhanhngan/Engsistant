import {
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Logger } from 'winston';
import { Response } from 'express';
import { GoogleClassroomService } from './google-classroom.service';

@Controller('classes')
@UseGuards(JwtAuthGuard)
// Userole guard
export class GoogleClassroomController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly googleClassroomService: GoogleClassroomService,
  ) {}

  @Get('/list')
  async listClassroom(@Req() req, @Res() res: Response) {
    try {
      const classrooms = await this.googleClassroomService.fetchClassroomData();
      res.json({ received: true });
    } catch (error) {
      this.logger.error(
        'Calling checkOutPaymnent()',
        error,
        StripeController.name,
      );
      throw error;
    }
  }
}
