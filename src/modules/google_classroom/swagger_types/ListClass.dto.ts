import { ApiResponseStatus } from 'src/common/enum/common.enum';
import { GoogleClassroomInfoDto } from '../dtos/GoogleClassroomInfo.dto';

export class ListClassDTO {
  message: string;
  status: ApiResponseStatus;
  classes: GoogleClassroomInfoDto[];
}
