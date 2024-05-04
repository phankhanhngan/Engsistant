import {
  Body,
  Controller,
  HttpCode,
  HttpException,
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
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LoginDto } from './dtos/LoginDto.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { OAuth2Client } from './google_client/google-client.config';
import { ApiResponse } from '@nestjs/swagger';
import { GoogleLoginTypeDTO } from './swagger_types/GoogleLogin.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RegisterRoleDto } from './dtos/RegisterRole.dto';
import { ApiResponseStatus, Role } from 'src/common/enum/common.enum';
import { UsersService } from '../users/users.service';
import { UserRtnDto } from './dtos/UserRtnDto.dto';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly oauth2Client: OAuth2Client,
  ) {}

  @Post('login/google')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    type: GoogleLoginTypeDTO,
  })
  async login(@Res() res: Response, @Req() req, @Body() loginDto: LoginDto) {
    try {
      const firebaseInfo = req.firebaseUser;
      console.log(firebaseInfo);
      if (new Date(firebaseInfo.exp * 1000) < new Date()) {
        throw new HttpException('Token expired', HttpStatus.UNAUTHORIZED);
      }

      const accessToken = await this.authService.googleLogin(firebaseInfo);
      console.log(accessToken);
      res.status(200).json({
        message: 'Login Successfully',
        status: ApiResponseStatus.SUCCESS,
        token: accessToken,
      });
    } catch (error) {
      this.logger.error('Calling login()', error, AuthController.name);
      throw error;
    }
  }

  @Post('register-role')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    type: GoogleLoginTypeDTO,
    description: `data: access token`,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async registerRole(
    @Res() res: Response,
    @Req() req,
    @Body() registerRoleDto: RegisterRoleDto,
  ) {
    try {
      const user = await this.userService.getUserByEmail(req.user.email);

      if (user == null) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // User has registered role
      if (user.role != Role.UNKNOWN) {
        return res.status(204).json({
          status: ApiResponseStatus.SUCCESS,
        });
      }

      // Register role
      const registeredRoleUser = await this.authService.registerRole(
        user,
        registerRoleDto.role,
      );

      // Generate token
      const userRtn = plainToInstance(UserRtnDto, registeredRoleUser);
      const token = await this.authService.generateToken(userRtn);

      res.status(200).json({
        message: 'Register role Successfully',
        status: ApiResponseStatus.SUCCESS,
        token: token,
      });
    } catch (error) {
      this.logger.error('Calling registerRole()', error, AuthController.name);
      throw error;
    }
  }
}
