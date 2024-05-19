import { CEFR } from 'src/common/constants/cefr-level';

export interface ListLessonResponseDto {
  id: string;
  sharedLink?: string;
  description?: string;
  name: string;
  level: CEFR;
  class: {
    id: string;
    name: string;
  };
}
