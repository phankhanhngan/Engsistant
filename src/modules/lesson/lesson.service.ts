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
import { VocabularyDto } from './dtos/Vocabulary.dto';
import { GrammarDto } from './dtos/Grammar.dto';
import e from 'express';
import { UserItem } from 'src/entities/userItem.entity';
import { StudentGetLessonResponseDto } from './dtos/StudentGetLessonResponse.dto';
import { generatePhoto } from '../pexels/pexels.service';
import { GoogleClassroomService } from '../google_classroom/google-classroom.service';

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
    @InjectRepository(UserItem)
    private userItemRepository: EntityRepository<UserItem>,
    private readonly gptService: GptService,
    private readonly dictionaryService: DictionaryService,
    private readonly googleClassroomService: GoogleClassroomService,
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
      console.log('Start building lesson for classId:', classId);
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
      lesson.cover = await generatePhoto('facebook cover books');

      await this.lessonRepository.persistAndFlush(lesson);

      // Separate the paragraph into sentences'
      // Call gpt to get meaning/example/thesaurus/audio of the word
      const sentencesAndIndexes = this.mapVocabIndex(paragraph, vocabularies);
      const dictMetaData = await this.gptService.generateVocabulary(
        level,
        sentencesAndIndexes,
      );

      // Store vocabulary into db
      console.log('Building lesson meta ...');

      const vocabBuild = await Promise.all(
        dictMetaData.map(async (vocabulary) => {
          const vocab = new Vocabulary();
          const vocabDict = await this.dictionaryService.fetchDictData(
            vocabulary.word,
            vocabulary.functionalLabel,
          );
          const audio = vocabDict?.audio ? vocabDict.audio : null;
          const pronunciationWritten = vocabDict?.pronunciationWritten
            ? vocabDict.pronunciationWritten
            : null;
          vocab.id = randomUUID();
          vocab.word = vocabulary.word;
          vocab.meaning = vocabulary.meaning;
          vocab.exampleMeta = JSON.stringify(vocabulary.examples);
          vocab.antonymMeta = JSON.stringify(vocabulary.antonyms);
          vocab.synonymMeta = JSON.stringify(vocabulary.synonyms);
          vocab.pronunciationAudio = audio;
          vocab.pronunciationWritten = pronunciationWritten;
          vocab.level = level;
          vocab.lesson = lesson;
          vocab.functionalLabel = vocabulary.functionalLabel;
          return vocab;
        }),
      );

      await this.vocabularyRepository.persistAndFlush(vocabBuild);

      // Call gpt to get grammar features/ usage, example
      console.log('... building grammar meta');
      const grammarMetaFromGpt = await this.gptService.getGrammarMeta(
        level,
        grammars,
      );
      // Store grammar into db
      const grammarBuild = grammarMetaFromGpt.map((gr) => {
        const grammar = new Grammar();
        grammar.id = randomUUID();
        grammar.name = gr.grammar;
        grammar.usage = JSON.stringify(gr.usage);
        grammar.exampleMeta = JSON.stringify(gr.example);
        grammar.lesson = lesson;
        return grammar;
      });
      await this.grammarRepository.persistAndFlush(grammarBuild);

      return lesson;
    } catch (error) {
      this.logger.error('Calling LessonService()', error, LessonService.name);
      throw error;
    }
  }

  async getLesson(
    lessonId: string,
    user: User,
  ): Promise<GetLessonResponseDto | StudentGetLessonResponseDto> {
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

      const isStudent = user.role === Role.STUDENT;
      const isTeacher = user.role === Role.TEACHER;

      if (isTeacher) {
        if (lesson.class.owner !== user) {
          throw new ForbiddenException('You do not have permission to access');
        }
      }

      if (isStudent) {
        const classes = await user.classes.loadItems();
        if (!classes.some((cls) => cls.id === lesson.class.id)) {
          throw new ForbiddenException('You do not have permission to access');
        }
      }

      // load grammars, vocab
      const grammars = await this.grammarRepository.find({ lesson: lesson });
      const vocabularies = await this.vocabularyRepository.find({ lesson });
      const grammarBuild = await Promise.all(
        grammars.map(async (grammar) => {
          const isMarked = await this.userItemRepository.findOne({
            userId: user.id,
            itemId: grammar.id,
          });
          const grammarRtn = {
            id: grammar.id,
            name: grammar.name,
            usage: grammar.usage,
            exampleMeta: JSON.parse(grammar.exampleMeta),
          };
          if (isStudent) {
            return {
              ...grammarRtn,
              isMarked: isMarked ? true : false,
            };
          }
          return grammarRtn;
        }),
      );
      const vocabBuild = await Promise.all(
        vocabularies.map(async (vocabulary) => {
          const isMarked = await this.userItemRepository.findOne({
            userId: user.id,
            itemId: vocabulary.id,
          });
          const vocabRtn = {
            id: vocabulary.id,
            word: vocabulary.word,
            meaning: vocabulary.meaning,
            exampleMeta: JSON.parse(vocabulary.exampleMeta),
            antonymMeta: JSON.parse(vocabulary.antonymMeta),
            synonymMeta: JSON.parse(vocabulary.synonymMeta),
            pronunciationAudio: vocabulary.pronunciationAudio,
            functionalLabel: vocabulary.functionalLabel,
            pronunciationWritten: vocabulary.pronunciationWritten,
            level: vocabulary.level,
          };
          if (isStudent) {
            return {
              ...vocabRtn,
              isMarked: isMarked ? true : false,
            };
          }
          return vocabRtn;
        }),
      );
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
        cover: lesson.cover,
        grammars: grammarBuild,
        vocabularies: vocabBuild,
      };
    } catch (error) {
      this.logger.error('Calling getLesson()', error, LessonService.name);
      throw error;
    }
  }

  async shareLesson(
    user: User,
    lessonId: string,
    file: Express.Multer.File,
  ): Promise<boolean> {
    try {
      const lesson = await this.lessonRepository.findOne(
        {
          id: lessonId,
        },
        { populate: ['class'] },
      );

      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }
      const clazz = lesson.class;

      if (clazz.owner !== user) {
        throw new ForbiddenException('You do not have permission to access');
      }
      const sharedLink = await this.googleClassroomService.shareLesson(
        user,
        lesson,
        clazz.googleCourseId,
        file,
      );
      lesson.sharedLink = sharedLink;
      await this.lessonRepository.flush();
      return true;
    } catch (error) {
      this.logger.error('Calling shareLesson()', error, LessonService.name);
      throw error;
    }
  }

  async listLessons(
    classId: string,
    user: User,
    level: CEFR | 'ALL',
    search?: string | null,
    status?: LessonStatus | 'ALL',
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
      const findFilter = {
        class: {
          id: classId,
        },
      };

      level && level !== 'ALL' ? (findFilter['level'] = level) : null;
      search && search !== ''
        ? (findFilter['name'] = { $like: `%${search}%` })
        : null;
      status && status !== 'ALL' ? (findFilter['status'] = status) : null;

      const lessons = await this.lessonRepository.find(findFilter, {
        populate: ['class'],
        orderBy: { created_at: 'DESC' },
      });

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
          cover: lesson.cover,
        };
      });
    } catch (error) {
      this.logger.error('Calling listLesson()', error, LessonService.name);
      throw error;
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
      if (!lessonToUpdate) {
        throw new NotFoundException('Lesson not found');
      }
      lessonToUpdate.status = status;
      await this.lessonRepository.flush();
      return true;
    } catch (error) {
      this.logger.error(
        'Calling updateLessonStatus()',
        error,
        LessonService.name,
      );
      throw error;
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
      lesson.cover = await generatePhoto('facebook cover books');

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
      throw error;
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
      throw error;
    }
  };

  async updateVocabulary(
    user: User,
    id: string,
    meaning: string,
    exampleMeta: string[],
    antonymMeta: string[],
    synonymMeta: string[],
  ): Promise<VocabularyDto> {
    try {
      const vocabulary = await this.vocabularyRepository.findOne({ id: id });
      if (!vocabulary) {
        throw new NotFoundException('Vocabulary not found');
      }
      // check if the user is the owner of the class having lessons with that vocabulary
      const lessonId = vocabulary.lesson.id;
      const lesson = await this.lessonRepository.findOne(
        { id: lessonId },
        { populate: ['class'] },
      );
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }
      const clazz = lesson.class;
      if (!clazz) {
        throw new NotFoundException('Class not found');
      }
      if (clazz.owner !== user) {
        throw new ForbiddenException('You do not have permission to access');
      }
      vocabulary.meaning = meaning;
      vocabulary.exampleMeta = JSON.stringify(exampleMeta);
      vocabulary.antonymMeta = JSON.stringify(antonymMeta);
      vocabulary.synonymMeta = JSON.stringify(synonymMeta);
      await this.vocabularyRepository.persistAndFlush(vocabulary);
      return {
        id: vocabulary.id,
        word: vocabulary.word,
        meaning: vocabulary.meaning,
        exampleMeta: JSON.parse(vocabulary.exampleMeta),
        antonymMeta: JSON.parse(vocabulary.antonymMeta),
        synonymMeta: JSON.parse(vocabulary.synonymMeta),
        pronunciationAudio: vocabulary.pronunciationAudio,
        functionalLabel: vocabulary.functionalLabel,
        level: vocabulary.level,
        pronunciationWritten: vocabulary.pronunciationWritten,
      };
    } catch (error) {
      this.logger.error(
        'Calling updateVocabulary()',
        error,
        LessonService.name,
      );
      throw error;
    }
  }

  async deleteVocabulary(user: User, id: string): Promise<boolean> {
    try {
      const vocabulary = await this.vocabularyRepository.findOne({ id: id });
      if (!vocabulary) {
        throw new NotFoundException('Vocabulary not found');
      }
      // check if the user is the owner of the class having lessons with that vocabulary
      const lessonId = vocabulary.lesson.id;
      const lesson = await this.lessonRepository.findOne(
        { id: lessonId },
        { populate: ['class'] },
      );
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }
      const clazz = lesson.class;
      if (!clazz) {
        throw new NotFoundException('Class not found');
      }
      if (clazz.owner !== user) {
        throw new ForbiddenException('You do not have permission to access');
      }
      await this.vocabularyRepository.removeAndFlush(vocabulary);
      return true;
    } catch (error) {
      this.logger.error(
        'Calling DeleteVocabularyDto()',
        error,
        LessonService.name,
      );
      throw error;
    }
  }

  async updateGrammar(
    user: User,
    id: string,
    usage: string,
    exampleMeta: string[],
  ): Promise<GrammarDto> {
    try {
      const grammar = await this.grammarRepository.findOne({ id: id });
      // check if the user is the owner of the class having lessons with that grammar
      const lessonId = grammar.lesson.id;
      const lesson = await this.lessonRepository.findOne(
        { id: lessonId },
        { populate: ['class'] },
      );
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }
      const clazz = lesson.class;
      if (!clazz) {
        throw new NotFoundException('Class not found');
      }
      if (clazz.owner !== user) {
        throw new ForbiddenException('You do not have permission to access');
      }
      grammar.usage = usage;
      grammar.exampleMeta = JSON.stringify(exampleMeta);
      await this.grammarRepository.persistAndFlush(grammar);
      return {
        id: grammar.id,
        name: grammar.name,
        usage: grammar.usage,
        exampleMeta: JSON.parse(grammar.exampleMeta),
      };
    } catch (error) {
      this.logger.error('Calling updateGrammar()', error, LessonService.name);
      throw error;
    }
  }

  async deleteGrammar(user: User, id: string): Promise<boolean> {
    try {
      const grammar = await this.grammarRepository.findOne({ id: id });
      if (!grammar) {
        throw new NotFoundException('Grammar not found');
      }
      // check if the user is the owner of the class having lessons with that grammar
      const lessonId = grammar.lesson.id;
      const lesson = await this.lessonRepository.findOne(
        { id: lessonId },
        { populate: ['class'] },
      );
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }
      const clazz = lesson.class;
      if (!clazz) {
        throw new NotFoundException('Class not found');
      }
      if (clazz.owner !== user) {
        throw new ForbiddenException('You do not have permission to access');
      }
      await this.grammarRepository.removeAndFlush(grammar);
      return true;
    } catch (error) {
      this.logger.error('Calling deleteGrammar()', error, LessonService.name);
      throw error;
    }
  }

  /**
   * Use for student to mark the item
   */
  async markItem(user: User, id: string): Promise<boolean> {
    try {
      const vocab = await this.vocabularyRepository.findOne({ id: id });
      const grammar = await this.grammarRepository.findOne({ id: id });
      if (!vocab && !grammar) {
        throw new NotFoundException('Item not found');
      }
      const item = vocab ? vocab : grammar;

      if (!item) {
        throw new NotFoundException('Item not found');
      }

      const lesson = await this.lessonRepository.findOne(
        { id: item.lesson.id },
        { populate: ['class'] },
      );

      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }
      const classes = await user.classes.loadItems();
      if (!classes.some((cls) => cls.id === lesson.class.id)) {
        throw new ForbiddenException('You do not have permission to access');
      }
      const isMarkedBefore = await this.userItemRepository.findOne({
        userId: user.id,
        itemId: item.id,
      });

      if (isMarkedBefore) {
        await this.userItemRepository.removeAndFlush(isMarkedBefore);
        return false;
      } else {
        const userItem = new UserItem();
        userItem.id = randomUUID();
        userItem.itemId = item.id;
        userItem.userId = user.id;
        await this.userItemRepository.persistAndFlush(userItem);
        return true;
      }
    } catch (error) {
      this.logger.error('Calling starItem()', error, LessonService.name);
      throw error;
    }
  }
}
