import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Role } from 'src/common/enum/common.enum';
@Exclude()
export class UserRtnDto {
  @ApiProperty()
  @Expose()
  googleId?: string;

  @ApiProperty()
  @Expose()
  email!: string | undefined;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  photo?: string;

  @ApiProperty()
  @Expose()
  role!: Role;

  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  created_at: Date;

  @ApiProperty()
  @Expose()
  updated_at: Date;
}
