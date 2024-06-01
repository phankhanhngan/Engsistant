import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
import { generatePastelColor, separateSentences } from 'src/common/utils/utils';
import { GptService } from '../gpt/gpt.service';
import { DictionaryService } from '../dict/dictionary.service';
import { LessonStatus, Role } from '../../common/enum/common.enum';
import { fullMockLesson } from '../../common/constants/mock';
import { VocabularyGenerateMetaDto } from '../gpt/dtos/VocabularyGenerateMetaDto.dto';
import { BadRequestError } from 'openai';

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
    private readonly gptService: GptService,
    private readonly dictionaryService: DictionaryService,
  ) {}

  async buildLesson(
    classId: string,
    level: CEFR,
    vocabularies: string[],
    grammars: string[],
    name: string,
    description: string,
    paragraph: string,
  ): Promise<Lesson> {
    try {
      // Store the lesson into db
      const clazz = await this.classRepository.findOne({ id: classId });

      if (!clazz) {
        throw new NotFoundException('Class not found');
      }

      const lesson = new Lesson();
      lesson.id = randomUUID();
      lesson.description = description; //TODO: replace description
      lesson.name = name; //TODO: replace name
      lesson.level = level;
      lesson.class = clazz;
      lesson.color = generatePastelColor();

      await this.lessonRepository.persistAndFlush(lesson);

      // Separate the paragraph into sentences'
      // Call gpt to get meaning/example/thesaurus/audio of the word
      const sentencesAndIndexes = this.mapVocabIndex(paragraph, vocabularies);
      const dictMetaData = await this.gptService.generateVocabulary(
        level,
        sentencesAndIndexes,
      );

      // Store vocabulary into db
      const vocabBuild = await Promise.all(
        dictMetaData.map(async (vocabulary) => {
          const vocab = new Vocabulary();
          const vocabDict = await this.dictionaryService.fetchDictData(
            vocabulary.word,
            vocabulary.functionalLabel,
          );
          vocab.id = randomUUID();
          vocab.word = vocabulary.word;
          vocab.meaning = vocabulary.meaning;
          vocab.exampleMeta = JSON.stringify(vocabulary.examples);
          vocab.antonymMeta = JSON.stringify(vocabulary.antonyms);
          vocab.synonymMeta = JSON.stringify(vocabulary.synonyms);
          vocab.pronunciationAudio = vocabDict.audio;
          vocab.pronunciationWritten = vocabDict.pronunciationWritten;
          vocab.level = level;
          vocab.lesson = lesson;
          vocab.functionalLabel = vocabulary.functionalLabel;
          return vocab;
        }),
      );

      await this.vocabularyRepository.persistAndFlush(vocabBuild);

      // Call gpt to get grammar features/ usage, example
      const grammarMetaFromGpt = await this.gptService.getGrammarMeta(
        level,
        grammars,
      );
      // Store grammar into db
      const grammarBuild = grammarMetaFromGpt.map((gr) => {
        const grammar = new Grammar();
        grammar.id = randomUUID();
        grammar.name = gr.grammar;
        grammar.usage = gr.usage;
        grammar.exampleMeta = JSON.stringify(gr.example);
        grammar.lesson = lesson;
        return grammar;
      });
      await this.grammarRepository.persistAndFlush(grammarBuild);

      return lesson;
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

      if (user.role === Role.TEACHER) {
        if (lesson.class.owner !== user) {
          throw new ForbiddenException('You do not have permission to access');
        }
      }

      if (user.role === Role.STUDENT) {
        const classes = await user.classes.loadItems();
        if (!classes.some((cls) => cls.id === lesson.class.id)) {
          throw new ForbiddenException('You do not have permission to access');
        }
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
          functionalLabel: vocabulary.functionalLabel,
          pronunciationWritten: vocabulary.pronunciationWritten,
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
      if (user.role === Role.TEACHER) {
        const clazz = await this.classRepository.findOne({ id: classId });
        if (!clazz) {
          throw new NotFoundException('Class not found');
        }
        if (clazz.owner !== user) {
          throw new ForbiddenException('You do not have permission to access');
        }
      }
      if (user.role === Role.STUDENT) {
        const classes = await user.classes.loadItems();
        if (!classes.some((cls) => cls.id === classId)) {
          throw new ForbiddenException('You do not have permission to access');
        }
      }
      const lessons = await this.lessonRepository.find(
        {
          class: {
            id: classId,
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

  async updateLessonStatus(
    lessonId: string,
    status: LessonStatus,
  ): Promise<boolean> {
    try {
      const lessonToUpdate = await this.lessonRepository.findOne({
        id: lessonId,
      });
      lessonToUpdate.status = status;
      await this.lessonRepository.flush();
      return true;
    } catch (error) {
      this.logger.error(
        'Calling updateLessonStatus()',
        error,
        LessonService.name,
      );
      throw new Error(
        'Failed to update lesson status due to error= ' + error.message,
      );
    }
  }

  async buildMockLesson(
    classId: string,
    level: CEFR,
    name: string,
    description: string,
    paragraph: string,
  ) {
    try {
      const clazz = await this.classRepository.findOne({ id: classId });

      if (!clazz) {
        throw new NotFoundException('Class not found');
      }

      const lesson = new Lesson();
      lesson.id = randomUUID();
      lesson.description = description;
      lesson.name = name;
      lesson.level = level;
      lesson.class = clazz;
      lesson.color = generatePastelColor();

      await this.lessonRepository.persistAndFlush(lesson);
      const mockVocab = fullMockLesson['vocabularies'];
      const mockGrammar = fullMockLesson['grammars'];

      const vocabBuild = await Promise.all(
        mockVocab.map(async (vocabulary) => {
          const vocab = new Vocabulary();
          vocab.id = randomUUID();
          vocab.word = vocabulary.word;
          vocab.meaning = vocabulary.meaning;
          vocab.exampleMeta = JSON.stringify(vocabulary.exampleMeta);
          vocab.antonymMeta = JSON.stringify(vocabulary.antonymMeta);
          vocab.synonymMeta = JSON.stringify(vocabulary.synonymMeta);
          vocab.pronunciationAudio = vocabulary.pronunciationAudio;
          vocab.level = level;
          vocab.lesson = lesson;
          vocab.functionalLabel = '';
          return vocab;
        }),
      );
      await this.vocabularyRepository.persistAndFlush(vocabBuild);

      const grammarBuild = mockGrammar.map((gr) => {
        const grammar = new Grammar();
        grammar.id = randomUUID();
        grammar.name = gr.name;
        grammar.usage = gr.usage;
        grammar.exampleMeta = JSON.stringify(gr.exampleMeta);
        grammar.lesson = lesson;
        return grammar;
      });
      await this.grammarRepository.persistAndFlush(grammarBuild);
      return lesson;
    } catch (error) {
      this.logger.error('Calling LessonService()', error, LessonService.name);
      throw new Error(
        'Failed to build mock lesson due to error= ' + error.message,
      );
    }
  }

  private mapVocabIndex = (
    paragraph: string,
    vocabularies: string[],
  ): VocabularyGenerateMetaDto[] => {
    try {
      // separate sentences then filter out for sentences having vocabularies
      const sentences = separateSentences(paragraph);
      const filteredSentences = sentences.filter((sentence) =>
        vocabularies.some((v) => sentence.includes(v)),
      );

      // map the index, if the there are the same words in the sentence, return 2 object with 2 index, but the same sentence
      // If there is no vocab in the sentence, do not map
      return vocabularies
        .map((v) => {
          // find sentence having v, if v apprear more than 1 time, return 2 object with 2 index
          const sentences = filteredSentences.filter((s) => s.includes(v));
          if (sentences.length < 1) {
            return null;
          }
          // get all indexes
          return sentences.map((sentence: string | string[]) => {
            return {
              word: v,
              index: sentence.indexOf(v),
              sentence: sentence,
            };
          });
        })
        .flat();
    } catch (error) {
      this.logger.error('Calling LessonService()', error, LessonService.name);
      throw new Error(
        'Failed to map vocab index due to error= ' + error.message,
      );
    }
  };
}
