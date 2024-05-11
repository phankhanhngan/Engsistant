import {
  Controller,
  Get,
  Inject,
  Logger,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ApiResponseStatus, Role } from 'src/common/enum/common.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleAuthGuard } from 'src/common/guards/role-auth.guard';
import { UsersService } from '../users/users.service';
import { ApiResponse } from '@nestjs/swagger';
import { ClassRtnDto } from '../users/dtos/ClassRtn.dto';

@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
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
}
