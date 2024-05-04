import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/entities';
import { AWSModule } from '../aws/aws.module';
import { PassportModule } from '@nestjs/passport';
import { GoogleClassroomController } from './google-classroom.controller';
import { GoogleClassroomService } from './google-classroom.service';

@Module({
  imports: [MikroOrmModule.forFeature([User]), AWSModule, PassportModule],
  controllers: [GoogleClassroomController],
  providers: [GoogleClassroomService],
})
export class GoogleClassroomModule {}
