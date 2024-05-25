import { IsBoolean, IsNotEmpty } from 'class-validator';
import { CEFR } from 'src/common/constants/cefr-level';

export class ListWordsDto {
  @IsNotEmpty()
  paragraph: string;
  @IsNotEmpty()
  level: CEFR;
  @IsBoolean()
  mock: boolean;
}
