import { Role } from 'src/common/enum/common.enum';

export class UpdateUserDto {
  role?: Role;
  photo?: string;
  name?: string;
}
