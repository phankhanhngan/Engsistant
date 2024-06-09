import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  NotFoundException,
  Post,
  Put,
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
import { SetGoogleTokenDto } from './dtos/SetGoogleToken.dto';
import { RoleAuthGuard } from 'src/common/guards/role-auth.guard';
import { AuthorizeTypeDto } from 'src/common/swagger_types/swagger-type.dto';
import { UpdateUserRequestDto } from './dtos/UpdateUserRequestDto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Class } from '../../entities/class.entity';
import { EntityRepository } from '@mikro-orm/core';

@UseGuards(JwtAuthGuard)
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(Class)
    private readonly userRepository: EntityRepository<Class>,
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
      if (!user) {
        throw new NotFoundException('User not found');
      }
      let numberOfClasses = null;
      let numberOfLessons = null;
      if (user.role === Role.TEACHER) {
        // count classes
        const classes = await this.userRepository.find({ owner: user });
        // count students
        numberOfClasses = classes.length;
        // count lessons
        numberOfLessons = classes
          .map((c) => c.lessons.loadItems())
          .flat().length;
      }
      return res.status(200).json({
        message: 'Get current user info successfully',
        status: ApiResponseStatus.SUCCESS,
        user: {
          ...plainToInstance(UserRtnDto, user),
          numberOfClasses,
          numberOfLessons,
        },
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

  @ApiResponse({
    status: 200,
    type: UserRtnDto,
  })
  @Put('/me')
  async updateCurrentUserInfo(
    @Res() res,
    @Body() updateUserDto: UpdateUserRequestDto,
    @Req() req,
  ) {
    try {
      const user = await this.usersService.getUserByEmail(req.user.email);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const updatedUser = await this.usersService.updateUser(
        user.id,
        updateUserDto.name,
        updateUserDto.photo,
      );
      return res.status(200).json({
        message: 'Get current user info successfully',
        status: ApiResponseStatus.SUCCESS,
        user: updatedUser,
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
      throw error;
    }
  }
}
