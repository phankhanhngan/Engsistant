import { ApiResponseStatus } from 'src/common/enum/common.enum';

export class GoogleLoginTypeDTO {
  message!: string;
  status!: ApiResponseStatus;
  token!: string; // access token
}
