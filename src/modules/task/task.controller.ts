import {
  Body,
  Controller,
  Post,
  Patch,
  UseGuards,
  Request,
  Get,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';
import { TaskDto } from 'modules/task/dto/task.dto';
import { TaskService } from 'modules/task/task.service';
import { Task } from 'src/common/entities';
import { ApiPath } from 'src/common/enums';

@Controller(ApiPath.CALENDAR)
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @ApiOperation({ summary: 'Getting all tasks' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Not found' })
  getChats(@Request() req: { user: { id: string } }): Promise<Task[]> {
    return this.taskService.getTasks(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a task', description: 'Create a new task' })
  @ApiBody({
    type: TaskDto,
    description: 'Task data to create a new task',
  })
  @ApiResponse({
    status: 201,
    description: 'The task has been successfully created',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createChat(
    @Body() createTaskDto: TaskDto,
    @Request() req: { user: { id: string } },
  ): Promise<Task> {
    return this.taskService.createTask(createTaskDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Not found' })
  deleteTask(@Param('id') id: string): Promise<void> {
    return this.taskService.deleteTask(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updating task data' })
  @ApiResponse({ status: 202, description: 'Updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async updateTask(
    @Param('id') id: string,
    @Body() taskData: TaskDto,
  ): Promise<Task> {
    try {
      return await this.taskService.updateTask(id, taskData);
    } catch (error) {
      throw error;
    }
  }
}
