import {
  Controller,
  Get,
  Inject,
  Logger,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponseStatus } from 'src/common/enum/common.enum';
import { UserRtnDto } from '../auth/dtos/UserRtnDto.dto';
import { plainToInstance } from 'class-transformer';

@UseGuards(JwtAuthGuard)
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @ApiResponse({
    status: 200,
    type: UserRtnDto,
  })
  @Get('/me')
  async getCurrentUserInfo(@Res() res, @Req() req) {
    try {
      const user = await this.usersService.getUserByEmail(req.user.email);
      return res.status(200).json({
        message: 'Get current user info successfully',
        status: ApiResponseStatus.SUCCESS,
        data: plainToInstance(UserRtnDto, user),
      });
    } catch (error) {
      this.logger.error(
        'Calling getCurrentUserInfo()',
        error,
        UsersController.name,
      );
      throw error;
    }
  }
}
