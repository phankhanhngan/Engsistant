import { Role } from 'src/common/enum/common.enum';

export class FireBaseAuthDTO {
  name: string;
  role: Role;
  accessToken: string;
  refreshToken: string;
}
