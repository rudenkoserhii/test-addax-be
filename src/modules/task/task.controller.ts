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
import { TaskRequestDto } from 'modules/task/dto/task-request.dto';
import { TaskDto } from 'modules/task/dto/task.dto';
import { TaskService } from 'modules/task/task.service';
import { Task } from 'src/common/entities';
import { ApiPath } from 'src/common/enums';
import { TaskResponseType } from 'src/common/types/task-response.type';

@Controller(ApiPath.CALENDAR)
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @ApiOperation({ summary: 'Getting all tasks' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Not found' })
  getTasks(
    @Request() req: { user: { id: string } },
  ): Promise<TaskResponseType[]> {
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
  createTask(
    @Body() createTaskDto: TaskRequestDto,
    @Request() req: { user: { id: string } },
  ): Promise<TaskResponseType> {
    return this.taskService.createTask(
      { ...createTaskDto, order: createTaskDto.order.toString() },
      req.user.id,
    );
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
    @Body() taskData: TaskRequestDto,
  ): Promise<TaskResponseType> {
    try {
      return await this.taskService.updateTask(id, {
        ...taskData,
        order: taskData.order.toString(),
      });
    } catch (error) {
      throw error;
    }
  }
}
