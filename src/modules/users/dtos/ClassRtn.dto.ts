import { ApiProperty } from '@nestjs/swagger';

export class ClassRtnDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  descriptionHeading: string;
  @ApiProperty()
  alternativeLink: string;
  @ApiProperty()
  driveLink: string;
  @ApiProperty()
  googleCourseId: string;
}
