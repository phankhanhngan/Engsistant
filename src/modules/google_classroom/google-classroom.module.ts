import { Module } from '@nestjs/common';
import { GoogleClassroomController } from './google-classroom.controller';
import { GoogleClassroomService } from './google-classroom.service';
import { Class } from 'src/entities/class.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/entities';

@Module({
  imports: [
    MikroOrmModule.forFeature([Class]),
    MikroOrmModule.forFeature([User]),
  ],
  exports: [GoogleClassroomService],
  controllers: [GoogleClassroomController],
  providers: [GoogleClassroomService],
})
export class GoogleClassroomModule {}
