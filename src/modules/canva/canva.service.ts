import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { User } from 'src/entities';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CanvaService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async decodeToken(canvaUserToken: string) {
    try {
      // decode token
      const decoded = this.jwtService.decode(canvaUserToken);
      if (!decoded) {
        return null;
      }
      if (!decoded['userId']) {
        return null;
      }
      const userId = decoded['userId'];
      const user = await this.userRepository.findOne({ canvaUserId: userId });
      if (!user) {
        return null;
      }
      return user;
    } catch (err) {
      this.logger.error('Calling decodeToken()', err, CanvaService.name);
      throw err;
    }
  }
}
