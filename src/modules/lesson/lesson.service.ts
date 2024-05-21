import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import 'dotenv/config';
import { CEFR } from 'src/common/constants/cefr-level';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Lesson } from 'src/entities/lesson.entity';
import { EntityRepository } from '@mikro-orm/core';
import { Vocabulary } from 'src/entities/vocabulary.entity';
import { randomUUID } from 'crypto';
import { Class } from 'src/entities/class.entity';
import { Grammar } from 'src/entities/grammar.entity';
import { User } from 'src/entities';
import { GetLessonResponseDto } from './dtos/GetLessonResponse.dto';
import { ListLessonResponseDto } from './dtos/ListLessonResponse.dto';
import { generatePastelColor } from 'src/common/utils/utils';

@Injectable()
export class LessonService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectRepository(Lesson)
    private readonly lessonRepository: EntityRepository<Lesson>,
    @InjectRepository(Class)
    private readonly classRepository: EntityRepository<Class>,
    @InjectRepository(Vocabulary)
    private vocabularyRepository: EntityRepository<Vocabulary>,
    @InjectRepository(Grammar)
    private grammarRepository: EntityRepository<Grammar>,
  ) {}

  async buildLesson(
    classId: string,
    level: CEFR,
    vocabularies: string[],
    grammars: string[],
    name: string,
    description: string,
  ): Promise<string[]> {
    try {
      // Separate the paragraph into sentences'
      // Call dictionary api to get meaning/example/therasus/audio of the word
      const vocabulary = vocabularies.map((word) => {
        return {
          word,
          meaning: 'meaning',
          example: 'example',
          synonyms: ['synonyms', 'synonyms'],
          antonyms: ['antonyms', 'antonyms'],
          audio: 'audio',
        };
      });

      // Store the lesson into db
      const clazz = await this.classRepository.findOne({ id: classId });

      if (!clazz) {
        throw new Error('Class not found');
      }

      const lesson = new Lesson();
      lesson.id = randomUUID();
      lesson.description = description; //TODO: replace description
      lesson.name = name; //TODO: replace name
      lesson.level = level;
      lesson.class = clazz;
      lesson.color = generatePastelColor();

      await this.lessonRepository.persistAndFlush(lesson);

      // Store vocabulary into db
      const vocabBuild = vocabulary.map((vocabulary) => {
        const vocab = new Vocabulary();
        vocab.id = randomUUID();
        vocab.word = vocabulary.word;
        vocab.meaning = vocabulary.meaning;
        vocab.exampleMeta = JSON.stringify(['hehe', 'haha']); //TODO: replace exampleMeta
        vocab.antonymMeta = JSON.stringify(vocabulary.antonyms);
        vocab.synonymMeta = JSON.stringify(vocabulary.synonyms);
        vocab.pronunciationAudio = vocabulary.audio;
        vocab.level = level;
        vocab.imageUrl = 'imageUrl'; //TODO: replace imageUrl
        vocab.lesson = lesson;
        vocab.functionalLabel = 'noun'; //TODO: replace functionalLabel
        return vocab;
      });
      await this.vocabularyRepository.persistAndFlush(vocabBuild);

      // Store grammar into db
      const grammarBuild = grammars.map((gr) => {
        // Call gpt to get grammar features/ usage, example

        const grammar = new Grammar();
        grammar.id = randomUUID();
        grammar.name = 'name'; //TODO: replace name
        grammar.usage = 'usage'; //TODO: replace usage
        grammar.exampleMeta = JSON.stringify(['example', 'hehi']); //TODO: replace exampleMeta
        grammar.lesson = lesson;
        return grammar;
      });
      await this.grammarRepository.persistAndFlush(grammarBuild);

      return ['excuse', 'blame', 'happen'];
    } catch (error) {
      this.logger.error('Calling LessonService()', error, LessonService.name);
      throw new Error('Failed to build lesson due to error= ' + error.message);
    }
  }

  async getLesson(lessonId: string, user: User): Promise<GetLessonResponseDto> {
    try {
      const lesson = await this.lessonRepository.findOne(
        {
          id: lessonId,
        },
        { populate: ['class'] },
      );

      if (!lesson) {
        return null;
      }

      if (lesson.class.owner !== user) {
        return null;
      }

      // load grammars, vocab
      const grammars = await this.grammarRepository.find({ lesson: lesson });
      const vocabularies = await this.vocabularyRepository.find({ lesson });
      const grammarBuild = grammars.map((grammar) => {
        return {
          id: grammar.id,
          name: grammar.name,
          usage: grammar.usage,
          exampleMeta: JSON.parse(grammar.exampleMeta),
        };
      });
      const vocabBuild = vocabularies.map((vocabulary) => {
        return {
          id: vocabulary.id,
          word: vocabulary.word,
          meaning: vocabulary.meaning,
          exampleMeta: JSON.parse(vocabulary.exampleMeta),
          antonymMeta: JSON.parse(vocabulary.antonymMeta),
          synonymMeta: JSON.parse(vocabulary.synonymMeta),
          pronunciationAudio: vocabulary.pronunciationAudio,
          imageUrl: vocabulary.imageUrl,
        };
      });
      return {
        id: lesson.id,
        status: lesson.status,
        sharedLink: lesson.sharedLink,
        color: lesson.color,
        description: lesson.description,
        name: lesson.name,
        level: lesson.level,
        class: {
          id: lesson.class.id,
          name: lesson.class.name,
        },
        grammars: grammarBuild,
        vocabularies: vocabBuild,
      };
    } catch (error) {
      this.logger.error('Calling getLesson()', error, LessonService.name);
      throw new Error('Failed to get lesson due to error= ' + error.message);
    }
  }

  async listLessons(
    classId: string,
    user: User,
  ): Promise<ListLessonResponseDto[]> {
    try {
      const lessons = await this.lessonRepository.find(
        {
          class: {
            id: classId,
            owner: user,
          },
        },
        { populate: ['class'] },
      );

      if (lessons == null || lessons.length < 1) {
        return [];
      }

      return lessons.map((lesson) => {
        return {
          id: lesson.id,
          status: lesson.status,
          sharedLink: lesson.sharedLink,
          description: lesson.description,
          color: lesson.color,
          name: lesson.name,
          level: lesson.level,
          class: {
            id: lesson.class.id,
            name: lesson.class.name,
          },
        };
      });
    } catch (error) {
      this.logger.error('Calling listLesson()', error, LessonService.name);
      throw new Error('Failed to list lesson due to error= ' + error.message);
    }
  }
}
