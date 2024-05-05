import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/entities';

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
