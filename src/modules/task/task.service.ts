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

  async getTasks(userId: string): Promise<Task[]> {
    try {
      const tasks = await this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.user', 'user')
        .leftJoinAndSelect('task.labels', 'label')
        .where('user.id = :userId', { userId })
        .getMany();

      return tasks;
    } catch (error) {
      throw error;
    }
  }
  async createTask(createTaskDto: TaskDto, userId: string): Promise<Task> {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const task = this.taskRepository.create({
        title: createTaskDto.title,
        content: createTaskDto.content ? createTaskDto.content : '',
        order: createTaskDto.order.toString(),
        user,
      } as DeepPartial<Task>);

      const newTask = await this.taskRepository.save(task);

      if (createTaskDto.label && createTaskDto.label.length > 0) {
        const labels = createTaskDto.label.map((labelData) => {
          const label = this.labelRepository.create({
            ...labelData,
            task: newTask,
          });
          return label;
        });

        await this.labelRepository.save(labels);
      }

      return newTask;
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

  async updateTask(id: string, taskData: TaskDto): Promise<Task> {
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

      if (taskData.order !== undefined) {
        task.order = taskData.order.toString();
      }

      if (taskData.label && taskData.label.length > 0) {
        const existingLabels = task.labels;
        const labelsToRemove = existingLabels.filter(
          (existingLabel) =>
            !taskData.label.find(
              (newLabel) => newLabel.id === existingLabel.id,
            ),
        );
        await this.labelRepository.remove(labelsToRemove);

        await Promise.all(
          taskData.label.map(async (newLabelData) => {
            let label = task.labels.find(
              (existingLabel) => existingLabel.id === newLabelData.id,
            );

            if (label) {
              label.color = newLabelData.color;
              label.text = newLabelData.text;
              label.order = newLabelData.order;
            } else {
              label = this.labelRepository.create({
                ...newLabelData,
                task,
              });
            }

            await this.labelRepository.save(label);
          }),
        );
      }

      const updatedTask = await this.taskRepository.save(task);

      return updatedTask;
    } catch (error) {
      throw error;
    }
  }
}
