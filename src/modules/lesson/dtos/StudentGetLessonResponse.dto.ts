import { CEFR } from 'src/common/constants/cefr-level';
import { LessonStatus } from 'src/common/enum/common.enum';

export interface StudentGrammarDto {
  id: string;
  name: string;
  usage: string;
  exampleMeta: string[];
  isMarked: boolean;
}
export interface StudentVocabularyDto {
  id: string;
  word: string;
  meaning: string;
  exampleMeta: string[];
  antonymMeta: string[];
  synonymMeta: string[];
  pronunciationAudio?: string;
  functionalLabel: string;
  level: CEFR;
  pronunciationWritten?: string;
  isMarked: boolean;
}

export interface StudentGetLessonResponseDto {
  id: string;
  status: LessonStatus;
  sharedLink?: string;
  description?: string;
  name: string;
  level: CEFR;
  color?: string;
  class: {
    id: string;
    name: string;
  };
  grammars: StudentGrammarDto[];
  vocabularies: StudentVocabularyDto[];
  cover?: string;
}
