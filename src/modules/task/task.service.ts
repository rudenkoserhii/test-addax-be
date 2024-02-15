import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DeepPartial, Repository } from 'typeorm';

import { TaskDto } from 'modules/task/dto/task.dto';
import { Task, Label } from 'src/common/entities';
import { TaskResponseType } from 'src/common/types/task-response.type';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Label)
    private readonly labelRepository: Repository<Label>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async getTasks(userId: string): Promise<TaskResponseType[]> {
    try {
      const tasks = await this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.user', 'user')
        .leftJoinAndSelect('task.labels', 'label')
        .where('user.id = :userId', { userId })
        .getMany();

      const response = tasks.map((task) => {
        return {
          id: task.id,
          date: task.date,
          title: task.title,
          content: task.content ? task.content : '',
          order: Number(task.order),
          labels:
            task.labels && task.labels.length > 0
              ? task.labels.map((label) => {
                  return {
                    id: label.id,
                    color: label.color,
                    text: label.text ? label.text : '',
                    order: Number(label.order),
                  };
                })
              : [],
        };
      });

      return response;
    } catch (error) {
      throw error;
    }
  }
  async createTask(
    createTaskDto: TaskDto,
    userId: string,
  ): Promise<TaskResponseType> {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const task = this.taskRepository.create({
        title: createTaskDto.title,
        date: createTaskDto.date,
        content: createTaskDto.content ? createTaskDto.content : '',
        order: createTaskDto.order,
        user,
      } as DeepPartial<Task>);

      const newTask = await this.taskRepository.save(task);

      if (createTaskDto.labels && createTaskDto.labels.length > 0) {
        const labels = createTaskDto.labels.map((labelData) => {
          const label = this.labelRepository.create({
            ...labelData,
            task: newTask,
          });
          return label;
        });

        await this.labelRepository.save(labels);
      }

      const response = {
        id: newTask.id,
        date: newTask.date,
        title: newTask.title,
        content: newTask.content ? task.content : '',
        order: Number(newTask.order),
        labels:
          newTask.labels && newTask.labels.length > 0
            ? newTask.labels.map((label) => {
                return {
                  id: label.id,
                  color: label.color,
                  text: label.text ? label.text : '',
                  order: Number(label.order),
                };
              })
            : [],
      };

      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const task = await this.taskRepository.findOne({
        where: { id },
        relations: ['labels'],
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      await Promise.all(
        task.labels.map(async (label) => {
          await this.labelRepository.remove(label);
        }),
      );

      await this.taskRepository.remove(task);
    } catch (error) {
      throw error;
    }
  }

  async updateTask(id: string, taskData: TaskDto): Promise<TaskResponseType> {
    try {
      const task = await this.taskRepository.findOneOrFail({
        where: { id },
        relations: ['labels'],
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      if (taskData.title) {
        task.title = taskData.title;
      }

      if (taskData.content !== undefined) {
        task.content = taskData.content;
      }

      if (taskData.date !== undefined) {
        task.date = taskData.date;
      }

      if (taskData.order !== undefined) {
        task.order = taskData.order.toString();
      }

      await this.taskRepository.save(task);

      if (taskData.labels && taskData.labels.length > 0) {
        const existingLabels = task.labels;

        task.labels.forEach((existingLabel) => {
          const updatedLabel = taskData.labels.find(
            (newLabel) => newLabel.id === existingLabel.id,
          );

          if (updatedLabel) {
            existingLabel.color = updatedLabel.color;
            existingLabel.text = updatedLabel.text;
            existingLabel.order = updatedLabel.order;
          }
        });

        const newLabels = taskData.labels.filter((label) => !label.id);
        const createdLabels = newLabels.map((labelData) => {
          const newLabel = this.labelRepository.create({
            ...labelData,
            task,
          });
          return newLabel;
        });
        await this.labelRepository.save([...createdLabels, ...task.labels]);

        const labelsToRemove = existingLabels.filter(
          (existingLabel) =>
            !taskData.labels.find(
              (newLabel) => newLabel.id === existingLabel.id,
            ),
        );

        await this.labelRepository.remove(labelsToRemove);
      }

      const updatedTask = await this.taskRepository.findOneOrFail({
        where: { id },
        relations: ['labels'],
      });

      const response = {
        id: updatedTask.id,
        date: updatedTask.date,
        title: updatedTask.title,
        content: updatedTask.content ? task.content : '',
        order: Number(updatedTask.order),
        labels:
          updatedTask.labels && updatedTask.labels.length > 0
            ? updatedTask.labels.map((label) => {
                return {
                  id: label.id,
                  color: label.color,
                  text: label.text ? label.text : '',
                  order: Number(label.order),
                };
              })
            : [],
      };

      return response;
    } catch (error) {
      throw error;
    }
  }
}
