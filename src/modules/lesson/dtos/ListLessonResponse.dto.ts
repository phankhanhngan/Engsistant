import { CEFR } from 'src/common/constants/cefr-level';
import { LessonStatus } from 'src/common/enum/common.enum';

export interface ListLessonResponseDto {
  id: string;
  status: LessonStatus;
  color?: string;
  sharedLink?: string;
  description?: string;
  name: string;
  level: CEFR;
  class: {
    id: string;
    name: string;
  };
}
