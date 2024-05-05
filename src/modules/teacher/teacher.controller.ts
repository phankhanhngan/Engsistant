import { Controller, Inject, Logger, UseGuards } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Role } from 'src/common/enum/common.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleAuthGuard } from 'src/common/guards/role-auth.guard';

@Controller('teacher')
@UseGuards(JwtAuthGuard)
@UseGuards(RoleAuthGuard([Role.TEACHER]))
export class TeacherController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
}
