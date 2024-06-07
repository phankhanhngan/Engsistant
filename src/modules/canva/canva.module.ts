import { Module } from '@nestjs/common';
import { Class } from 'src/entities/class.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/entities';
import { CanvaService } from './canva.service';
import { CanvaController } from './canva.controller';
import { LessonService } from '../lesson/lesson.service';
import { Lesson } from '../../entities/lesson.entity';
import { Vocabulary } from '../../entities/vocabulary.entity';
import { Grammar } from '../../entities/grammar.entity';
import { UserItem } from '../../entities/userItem.entity';
import { GptService } from '../gpt/gpt.service';
import { DictionaryService } from '../dict/dictionary.service';
import { GoogleClassroomService } from '../google_classroom/google-classroom.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([Class]),
    MikroOrmModule.forFeature([User]),
    MikroOrmModule.forFeature([Lesson]),
    MikroOrmModule.forFeature([Vocabulary]),
    MikroOrmModule.forFeature([Grammar]),
    MikroOrmModule.forFeature([UserItem]),
  ],
  exports: [CanvaService],
  controllers: [CanvaController],
  providers: [
    CanvaService,
    LessonService,
    GptService,
    DictionaryService,
    GoogleClassroomService,
  ],
})
export class CanvaModule {}
