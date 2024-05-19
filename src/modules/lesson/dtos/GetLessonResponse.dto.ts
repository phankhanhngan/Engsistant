import { CEFR } from 'src/common/constants/cefr-level';

export interface GetLessonResponseDto {
  id: string;
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
