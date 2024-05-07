import {
  Body,
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
import { UsersService } from './users.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponseStatus, Role } from 'src/common/enum/common.enum';
import { UserRtnDto } from '../auth/dtos/UserRtnDto.dto';
import { plainToInstance } from 'class-transformer';
import { AuthorizeTypeDto } from '../google_classroom/swagger_types/Authorize.dto';
import { SetGoogleTokenDto } from './dtos/SetGoogleToken.dto';
import { RoleAuthGuard } from 'src/common/guards/role-auth.guard';
import { Class } from 'src/entities/class.entity';
import { ClassRtnDto } from './dtos/ClassRtn.dto';

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

  @Post('/set-google-token')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RoleAuthGuard([Role.TEACHER]))
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiResponse({
    status: 200,
    type: AuthorizeTypeDto,
    description: `Get the authorize url that redirects to Google classroom authorization page.`,
  })
  async setGoogleToken(
    @Req() req,
    @Res() res,
    @Body() setTokenDto: SetGoogleTokenDto,
  ) {
    try {
      const user = req.user;
      const code = setTokenDto.code;
      const isSucess = await this.usersService.setGoogleToken(user, code);

      if (isSucess) {
        res.status(200).json({
          message: 'Set Google token successfully',
          status: ApiResponseStatus.SUCCESS,
        });
      } else {
        res.status(400).json({
          message: 'Set Google token failed',
          status: ApiResponseStatus.FAILURE,
        });
      }
    } catch (error) {
      this.logger.error(
        'Calling setGoogleToken()',
        error,
        UsersController.name,
      );
      res.status(500).json({
        message: `Set Google token failed due to error=${error.message}`,
        status: ApiResponseStatus.FAILURE,
      });
    }
  }
}
