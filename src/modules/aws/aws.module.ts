import { Module } from '@nestjs/common';
import { AWSService } from './aws.service';
import { UsersService } from '../users/users.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/entities';
import { AwsController } from './aws.controller';
// import { StripeService } from '../stripe/stripe.service';

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  controllers: [AwsController],
  providers: [AWSService],
  exports: [AWSService],
})
export class AWSModule {}
