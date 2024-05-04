import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum RegisterRole {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export class RegisterRoleDto {
  @IsNotEmpty()
  @IsEnum(RegisterRole)
  @ApiProperty()
  role!: RegisterRole;
}
