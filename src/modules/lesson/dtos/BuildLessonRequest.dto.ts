import { IsArray, IsBoolean, IsNotEmpty } from 'class-validator';
import { CEFR } from 'src/common/constants/cefr-level';

export class BuildLessonRequestDto {
  @IsNotEmpty()
  classId: string;
  @IsNotEmpty()
  name!: string;
  @IsNotEmpty()
  description!: string;
  @IsArray()
  vocabularies: string[];
  @IsNotEmpty()
  grammars: string[];
  @IsNotEmpty()
  level: CEFR;
  @IsBoolean()
  mock: boolean;
}
