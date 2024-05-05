import { ApiResponseStatus } from 'src/common/enum/common.enum';

export class AuthorizeTypeDto {
  message: string;
  status: ApiResponseStatus;
  authorizeUrl!: string;
}
