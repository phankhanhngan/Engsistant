import { Expose } from 'class-transformer';
import { IsString, ValidateIf } from 'class-validator';

export class UpdateUserRequestDto {
  @Expose()
  @ValidateIf((obj, value) => value)
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @Expose()
  @ValidateIf((obj, value) => value)
  @IsString({ message: 'Photo must be a string' })
  photo?: string;
}
