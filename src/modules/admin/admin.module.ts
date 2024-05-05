import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from 'src/entities';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [MikroOrmModule.forFeature([User]), UsersModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
