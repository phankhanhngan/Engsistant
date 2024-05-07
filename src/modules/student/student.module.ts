import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/entities';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [MikroOrmModule.forFeature([User]), UsersModule],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
