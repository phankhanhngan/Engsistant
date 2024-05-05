import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/entities';
import { UsersService } from './users.service';
import { GoogleClassroomModule } from '../google_classroom/google-classroom.module';

@Module({
  imports: [MikroOrmModule.forFeature([User]), GoogleClassroomModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
