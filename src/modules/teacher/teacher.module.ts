import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/entities';
import { Class } from 'src/entities/class.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([User]),
    MikroOrmModule.forFeature([Class]),
  ],
  controllers: [TeacherController],
  providers: [TeacherService],
})
export class TeacherModule {}
