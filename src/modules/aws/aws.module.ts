import { Module } from '@nestjs/common';
import { AWSService } from './aws.service';
import { UsersService } from '../users/users.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/entities';
// import { StripeService } from '../stripe/stripe.service';

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  controllers: [],
  providers: [AWSService, UsersService],
  exports: [AWSService],
})
export class AWSModule {}
