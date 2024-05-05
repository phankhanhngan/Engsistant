import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { UsersModule } from '../users/users.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/entities';

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  controllers: [TeacherController],
  providers: [TeacherService],
})
export class TeacherModule {}
