import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nest-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { UsersService } from '../users/users.service';
import { UserRtnDto } from './dtos/UserRtnDto.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User } from 'src/entities';
import { UserFirebase } from './dtos/UserFirebase.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { randomUUID } from 'crypto';
import { Role } from 'src/common/enum/common.enum';
import { RegisterRole } from './dtos/RegisterRole.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly em: EntityManager,
    private readonly userService: UsersService,
    private readonly mailerService: MailerService,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  async sendMail(
    email: string,
    code: string,
    name: string,
    template: string,
    subject: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: subject,
        template: template,
        context: {
          name: name,
          code: code,
        },
      });
    } catch (error) {
      this.logger.error('Calling sendMail()', error, AuthService.name);
      throw error;
    }
  }

  async googleLogin(firebaseUser: UserFirebase): Promise<string> {
    try {
      // Check if user exists
      const userDb = await this.userService.getUserByEmail(firebaseUser.email);
      let userRtn: UserRtnDto;

      if (userDb == null) {
        // Insert user to db
        const user = new User();
        // generate uuid
        user.id = randomUUID();
        user.authId = firebaseUser.userId;
        user.email = firebaseUser.email;
        user.name = firebaseUser.name;
        user.role = Role.UNKNOWN;
        user.photo = firebaseUser.picture;
        this.userRepository.persist(user).flush();
        userRtn = plainToInstance(UserRtnDto, user);
      } else {
        if (userDb.authId == null) {
          userDb.authId = firebaseUser.userId;
          this.userRepository.persist(userDb).flush();
        }
        // Generate token
        userRtn = plainToInstance(UserRtnDto, userDb);
      }
      const accessToken = this.generateToken(userRtn);
      return accessToken;
    } catch (error) {
      this.logger.error('Calling googleLogin()', error, AuthService.name);
      throw error;
    }
  }

  async registerRole(user: User, role: RegisterRole): Promise<User> {
    try {
      // map RegisterRole to Role
      if (role === RegisterRole.TEACHER) user.role = Role.TEACHER;
      else if (role === RegisterRole.STUDENT) user.role = Role.STUDENT;

      await this.em.persistAndFlush(user);
      return user;
    } catch (error) {
      this.logger.error('Calling registerRole()', error, AuthService.name);
      throw error;
    }
  }

  generateToken = async (user: UserRtnDto): Promise<string> => {
    try {
      const accessToken = await this.jwtService.signAsync({
        ...user,
      });
      return accessToken;
    } catch (error) {
      this.logger.error('Calling generateToken()', error, AuthService.name);
      throw error;
    }
  };
  // async validateGoogleLogin(user: IUserAuthen | IUserAuthenV2) {
  //   try {
  //     const userDb = await this.getUserByEmail(user.email);
  //     if (userDb && userDb.status === UserStatus.DISABLED)
  //       throw new HttpException('User are disabled', HttpStatus.FORBIDDEN);
  //     if (!userDb) {
  //       await this.userService.addUser(plainToInstance(UserDTO, user), null, 0);
  //     } else {
  //       if (!userDb.googleId) {
  //         userDb.googleId = user.googleId;
  //         userDb.status = UserStatus.ACTIVE;
  //         await this.em.persistAndFlush(userDb);
  //       }
  //     }
  //     const userRtn: UserRtnDto = plainToInstance(
  //       UserRtnDto,
  //       await this.userService.getUserByEmail(user.email),
  //     );
  //     const accessToken = await this.jwtService.signAsync({
  //       ...userRtn,
  //     });
  //     return {
  //       token: accessToken,
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async validateLogin(loginDto: LoginDto) {
  //   try {
  //     const userDb = await this.getUserByEmail(loginDto.email);
  //     if (!userDb)
  //       throw new HttpException(
  //         'Invalid email or password',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     if (!userDb.verificationCode)
  //       throw new HttpException(
  //         'Email has not been verified',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     if (userDb.status === UserStatus.DISABLED)
  //       throw new HttpException('User are disabled', HttpStatus.BAD_REQUEST);
  //     const isValidPass = await bcrypt.compare(
  //       loginDto.password,
  //       userDb.password,
  //     );
  //     const user: UserRtnDto = plainToInstance(UserRtnDto, userDb);
  //     if (isValidPass) {
  //       const accessToken = await this.jwtService.signAsync({
  //         ...user,
  //       });
  //       return {
  //         token: accessToken,
  //       };
  //     } else {
  //       throw new HttpException(
  //         'Invalid email or password',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // checkIsRegister(userDb: User) {
  //   return userDb && userDb.status === UserStatus.REGISTING;
  // }

  // async performRegister(dto: RegisterDto) {
  //   try {
  //     const userDb = await this.getUserByEmail(dto.email);
  //     const { verificationCode, verificationToken } =
  //       await this.generateVerificationCode(
  //         6,
  //         dto.email,
  //         parseInt(process.env.MAIL_EXPIRATION_TIME),
  //       );
  //     dto.verificationCode = verificationToken;
  //     if (this.checkIsRegister(userDb)) {
  //       userDb.verificationCode = verificationToken;
  //       userDb.status = UserStatus.REGISTING;
  //       await this.em.persistAndFlush(userDb);
  //     } else {
  //       await this.userService.addUser(
  //         plainToInstance(UserDTO, dto),
  //         null,
  //         0,
  //         UserStatus.REGISTING,
  //       );
  //     }
  //     this.sendMail(
  //       dto.email,
  //       verificationCode,
  //       dto.email.split('@')[0],
  //       './verification',
  //       'Account confirmation - Rentally Team',
  //     );
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async resendEmail(email: string) {
  //   try {
  //     const userDb = await this.userService.getUserByEmail(email);
  //     if (!userDb)
  //       throw new HttpException('Invalid email', HttpStatus.BAD_REQUEST);
  //     if (userDb.status === UserStatus.ACTIVE)
  //       throw new HttpException(
  //         'Email has been verified',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     const { verificationCode, verificationToken } =
  //       await this.generateVerificationCode(
  //         6,
  //         email,
  //         parseInt(process.env.MAIL_EXPIRATION_TIME),
  //       );
  //     userDb.verificationCode = verificationToken;
  //     await this.em.persistAndFlush(userDb);
  //     this.sendMail(
  //       userDb.email,
  //       verificationCode,
  //       userDb.firstName + ' ' + userDb.lastName,
  //       './verification',
  //       'Account confirmation - Rentally Team',
  //     );
  //   } catch (error) {
  //     throw error;
  //   }
  // }
  // async verifyLoginToken(checkDto: CheckCodeDto) {
  //   try {
  //     const userDb = await this.userService.getUserByEmail(checkDto.email);
  //     if (userDb.status == UserStatus.ACTIVE)
  //       throw new HttpException(
  //         'Email has been verified',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     const objToken = this.jwtService.decode(userDb.verificationCode);
  //     if (new Date(objToken['expiry']) < new Date()) {
  //       throw new HttpException('Code is expired', HttpStatus.BAD_REQUEST);
  //     }
  //     if (objToken['code'] === checkDto.code) {
  //       userDb.status = UserStatus.ACTIVE;
  //       await this.em.persistAndFlush(userDb);
  //       const userRtn: UserRtnDto = plainToInstance(UserRtnDto, userDb);
  //       const accessToken = await this.jwtService.signAsync({
  //         ...userRtn,
  //       });
  //       return {
  //         token: accessToken,
  //       };
  //     } else {
  //       throw new HttpException(
  //         'Invalid verification code',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // }
  // async forgotPass(emailDTO: EmailDto) {
  //   try {
  //     const userDb = await this.userService.getUserByEmail(emailDTO.email);
  //     if (!userDb.verificationCode)
  //       throw new HttpException(
  //         'Email has not been verified',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     if (userDb.status === UserStatus.DISABLED)
  //       throw new HttpException('User are disabled', HttpStatus.BAD_REQUEST);
  //     const { verificationCode, verificationToken } =
  //       await this.generateVerificationCode(
  //         6,
  //         emailDTO.email,
  //         parseInt(process.env.MAIL_FORGOT_PASS_EXPIRATION_TIME),
  //       );
  //     userDb.verificationCode = verificationToken;
  //     await this.em.persistAndFlush(userDb);
  //     this.sendMail(
  //       userDb.email,
  //       verificationCode,
  //       userDb.firstName + ' ' + userDb.lastName,
  //       './reset_password',
  //       'Reset Password Confimation - Rentally Team',
  //     );
  //     return verificationToken;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async verifyResetPassToken(checkDto: CheckCodeDto) {
  //   try {
  //     const userDb = await this.userService.getUserByEmail(checkDto.email);
  //     const objToken = this.jwtService.decode(userDb.verificationCode);
  //     if (new Date(objToken['expiry']) < new Date()) {
  //       throw new HttpException('Code is expired', HttpStatus.BAD_REQUEST);
  //     }
  //     if (objToken['code'] === checkDto.code) {
  //       userDb.status = UserStatus.ACTIVE;
  //       await this.em.persistAndFlush(userDb);
  //       return true;
  //     } else {
  //       throw new HttpException(
  //         'Invalid verification code',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async resetPassword(resetPasswordDto: ResetPasswordDto) {
  //   try {
  //     const userDb = await this.userService.getUserByEmail(
  //       resetPasswordDto.email,
  //     );
  //     const objToken = this.jwtService.decode(userDb.verificationCode);
  //     if (objToken['code'] === resetPasswordDto.code) {
  //       userDb.password = await this.userService.hashPassword(
  //         resetPasswordDto.password,
  //       );
  //       await this.em.persistAndFlush(userDb);
  //     } else {
  //       throw new HttpException('Code is invalid', HttpStatus.BAD_REQUEST);
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // }
  // async generateVerificationCode(length: number, email: string, exp: number) {
  //   const verificationCode =
  //     'R-' +
  //     Math.floor(
  //       Math.pow(10, length - 1) +
  //         Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1),
  //     );
  //   const verificationToken = await this.jwtService.signAsync({
  //     email: email,
  //     code: verificationCode,
  //     expiry: new Date(new Date().getTime() + exp),
  //   });
  //   return { verificationCode, verificationToken };
  // }

  // async getUserByEmail(email: string) {
  //   try {
  //     const userDb = await this.userRepository.findOne({ email: email });
  //     return userDb;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
