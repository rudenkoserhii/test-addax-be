import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TaskController } from 'modules/task/task.controller';
import { TaskService } from 'modules/task/task.service';
import { UserService } from 'modules/user/user.service';
import { Label, Task, User } from 'src/common/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Task, User, Label])],
  controllers: [TaskController],
  providers: [TaskService, UserService, JwtService],
  exports: [TaskService],
})
export class TaskModule {}
