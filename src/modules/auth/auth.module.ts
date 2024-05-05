import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/entities';
import { PassportModule } from '@nestjs/passport';
import { OAuth2Client } from './google_client/google-client.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [MikroOrmModule.forFeature([User]), UsersModule, PassportModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, OAuth2Client],
})
export class AuthModule {}
