import {
  Body,
  Controller,
  Get,
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
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RegisterRoleDto } from './dtos/RegisterRole.dto';
import { ApiResponseStatus, Role } from 'src/common/enum/common.enum';
import { UsersService } from '../users/users.service';
import { UserRtnDto } from './dtos/UserRtnDto.dto';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { GoogleLoginTypeDTO } from 'src/common/swagger_types/swagger-type.dto';
import { LoginCanvaDto } from './dtos/LoginCanvaDto.dto';
import { NONCE_EXPIRY_MS } from '../../common/constants/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User } from '../../entities';
import { EntityRepository } from '@mikro-orm/mysql';
import * as crypto from 'crypto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
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
      if (new Date(firebaseInfo.exp * 1000) < new Date()) {
        throw new HttpException('Token expired', HttpStatus.UNAUTHORIZED);
      }

      const accessToken = await this.authService.googleLogin(firebaseInfo);
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

  @Get('configuration/start')
  async configCanva(@Res() res: Response, @Req() req) {
    try {
      const { state } = req.query;
      // Generate a nonce
      const nonce = crypto.randomUUID();

      // Create an expiry time for the nonce
      const nonceExpiry = Date.now() + NONCE_EXPIRY_MS;

      // Store the nonce and expiry time in a stringified JSON array
      const nonceWithExpiry = JSON.stringify([nonce, nonceExpiry]);

      // Store the nonce and expiry time in a cookie
      res.cookie('nonceWithExpiry', nonceWithExpiry, {
        httpOnly: true,
        secure: true,
        signed: true,
        maxAge: NONCE_EXPIRY_MS,
      });
      const params = new URLSearchParams({
        state,
        nonce,
      });

      return res.redirect(
        302,
        `https://www.canva.com/apps/configure/link?${params.toString()}`,
      );
    } catch (error) {
      this.logger.error('Calling login()', error, AuthController.name);
      throw error;
    }
  }

  @Post('login/canva')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    type: GoogleLoginTypeDTO,
  })
  async loginCanva(
    @Res() res: Response,
    @Req() req,
    @Body() loginCanvaDto: LoginCanvaDto,
  ) {
    try {
      const firebaseInfo = req.firebaseUser;
      if (new Date(firebaseInfo.exp * 1000) < new Date()) {
        throw new HttpException('Token expired', HttpStatus.UNAUTHORIZED);
      }

      const accessToken = await this.authService.googleLogin(firebaseInfo);
      const user = await this.userService.getUserByEmail(firebaseInfo.email);

      // decode canva token
      const decoded = this.jwtService.decode(loginCanvaDto.canvaUserToken);
      if (decoded == null) {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }
      if (decoded['userId'] != null && user.canvaUserId == null) {
        user.canvaUserId = decoded['userId'];
        this.userRepository.persistAndFlush(user);
      }
      return res.status(200).json({
        message: 'Login Successfully',
        status: ApiResponseStatus.SUCCESS,
        token: accessToken,
        state: loginCanvaDto.canvaState,
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
