import { CEFR } from 'src/common/constants/cefr-level';
import { LessonStatus } from 'src/common/enum/common.enum';
import { VocabularyDto } from './Vocabulary.dto';
import { GrammarDto } from './Grammar.dto';

export interface GetLessonResponseDto {
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
  grammars: GrammarDto[];
  vocabularies: VocabularyDto[];
  cover?: string;
}
