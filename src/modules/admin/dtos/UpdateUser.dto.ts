import { IsEnum } from 'class-validator';
import { Role } from 'src/common/enum/common.enum';

export class UpdateUserDto {
  @IsEnum(Role)
  role: Role;

  googleRefreshToken?: string;
  name?: string;
  authId?: string;
}
