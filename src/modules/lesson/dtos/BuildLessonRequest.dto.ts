import { IsArray, IsNotEmpty } from 'class-validator';
import { CEFR } from 'src/common/constants/cefr-level';

export class BuildLessonRequestDto {
  @IsNotEmpty({ message: 'ClassId is required' })
  classId: string;
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;
  @IsNotEmpty({ message: 'Description is required' })
  description!: string;
  @IsArray({ message: 'Vocabularies is required' })
  vocabularies: string[];
  @IsNotEmpty({ message: 'Paragraph is required' })
  paragraph: string;
  @IsNotEmpty({ message: 'Grammars is required' })
  grammars: string[];
  @IsNotEmpty({ message: 'Level is required' })
  level: CEFR;
  mock?: boolean;
}
