import { CEFR } from 'src/common/constants/cefr-level';

export interface ListWordsDto {
  paragraph: string;
  level: CEFR;
}
