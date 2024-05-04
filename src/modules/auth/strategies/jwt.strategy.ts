import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRtnDto } from '../dtos/UserRtnDto.dto';
import { UsersService } from 'src/modules/users/users.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly userService: UsersService,
  ) {
    super({
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
  async validate(payload: UserRtnDto): Promise<UserRtnDto> {
    try {
      const { email } = payload;
      const userDb = await this.userService.getUserByEmail(email);
      if (!userDb) throw new UnauthorizedException('Account not found!');
      return userDb;
    } catch (error) {
      this.logger.error('Calling validate()', error, JwtStrategy.name);
      throw error;
    }
  }
}
