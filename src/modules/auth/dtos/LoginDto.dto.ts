import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
@Exclude()
export class LoginDto {
  @IsNotEmpty()
  @Expose()
  token!: string;
}
