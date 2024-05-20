import { CEFR } from 'src/common/constants/cefr-level';
import { LessonStatus } from 'src/common/enum/common.enum';

export interface GetLessonResponseDto {
  id: string;
  status: LessonStatus;
  sharedLink?: string;
  description?: string;
  name: string;
  level: CEFR;
  class: {
    id: string;
    name: string;
  };
  grammars: {
    id: string;
    name: string;
    usage: string;
    exampleMeta: string[];
  }[];
  vocabularies: {
    id: string;
    word: string;
    meaning: string;
    exampleMeta: string[];
    antonymMeta: string[];
    synonymMeta: string[];
    pronunciationAudio: string;
    imageUrl: string;
  }[];
}
