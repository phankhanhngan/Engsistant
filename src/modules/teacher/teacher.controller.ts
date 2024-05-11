import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
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
import { TeacherService } from './teacher.service';
import { ApiResponse } from '@nestjs/swagger';
import { ClassRtnDto } from '../users/dtos/ClassRtn.dto';

@Controller('teacher')
@UseGuards(JwtAuthGuard)
export class TeacherController {
  constructor(
    private readonly teacherService: TeacherService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Get('/classes')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({
    status: 200,
    type: Array<ClassRtnDto>,
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

  // list students
}
