import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/entities';

export class ClassRtnDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  description?: string;
  @ApiProperty()
  descriptionHeading?: string;
  @ApiProperty()
  alternativeLink?: string;
  @ApiProperty()
  driveLink?: string;
  @ApiProperty()
  googleCourseId?: string;
  @ApiProperty()
  color?: string;
  @ApiProperty()
  students?: User[];
  @ApiProperty()
  lessons?: {
    id: string;
    name: string;
    description: string;
    cover: string;
  }[];
  @ApiProperty()
  cover: string;
}
