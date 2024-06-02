import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/entities';
import { Class } from 'src/entities/class.entity';
import { GptService } from '../gpt/gpt.service';
import { LessonService } from '../lesson/lesson.service';
import { Lesson } from 'src/entities/lesson.entity';
import { Vocabulary } from 'src/entities/vocabulary.entity';
import { Grammar } from 'src/entities/grammar.entity';
import { DictionaryService } from '../dict/dictionary.service';
import { UserItem } from 'src/entities/userItem.entity';
import { GoogleClassroomService } from '../google_classroom/google-classroom.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([User]),
    MikroOrmModule.forFeature([Class]),
    MikroOrmModule.forFeature([Lesson]),
    MikroOrmModule.forFeature([Vocabulary]),
    MikroOrmModule.forFeature([Grammar]),
    MikroOrmModule.forFeature([UserItem]),
  ],
  controllers: [TeacherController],
  providers: [
    TeacherService,
    GptService,
    LessonService,
    DictionaryService,
    GoogleClassroomService,
  ],
})
export class TeacherModule {}
