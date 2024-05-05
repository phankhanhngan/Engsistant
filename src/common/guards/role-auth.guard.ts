import { InjectRepository } from '@mikro-orm/nestjs';
import { UsersService } from '../../modules/users/users.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CanActivate, ExecutionContext, Inject, mixin } from '@nestjs/common';
import { EntityRepository } from '@mikro-orm/core';
import { User } from 'src/entities';

export const RoleAuthGuard = (acceptedRoles: Array<string>) => {
  class RoleAuthGuardMixin implements CanActivate {
    constructor(
      @InjectRepository(User)
      readonly userRepository: EntityRepository<User>,
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const req = context.switchToHttp().getRequest();
      const user = req.user;
      if (!acceptedRoles.includes(user.role)) {
        throw new HttpException(
          'You are not allow to access to this route',
          HttpStatus.FORBIDDEN,
        );
      }
      return true;
    }
  }

  return mixin(RoleAuthGuardMixin);
};
