import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/entities';
import { UsersModule } from '../users/users.module';
import { LessonService } from '../lesson/lesson.service';
import { Lesson } from 'src/entities/lesson.entity';
import { Class } from 'src/entities/class.entity';
import { Vocabulary } from 'src/entities/vocabulary.entity';
import { Grammar } from 'src/entities/grammar.entity';
import { GptService } from '../gpt/gpt.service';
import { DictionaryService } from '../dict/dictionary.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([User]),
    MikroOrmModule.forFeature([Lesson]),
    MikroOrmModule.forFeature([Class]),
    MikroOrmModule.forFeature([Vocabulary]),
    MikroOrmModule.forFeature([Grammar]),
    UsersModule,
  ],
  controllers: [StudentController],
  providers: [StudentService, LessonService, GptService, DictionaryService],
})
export class StudentModule {}
