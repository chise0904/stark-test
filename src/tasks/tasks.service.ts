// src/tasks/tasks.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Task, TaskStatus } from './model/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UsersService } from '@/users/users.service';
import { TeamsService } from '@/teams/teams.service';
import { User } from '@/users/model/user.entity';
import { FindTasksDto, TaskSortField } from './dto/find-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    private readonly usersService: UsersService,
    private readonly teamsService: TeamsService,
  ) { }

  async create(createTaskDto: CreateTaskDto, userId: number): Promise<Task> {
    // 檢查團隊存在且用戶是團隊成員
    const team = await this.teamsService.findOne(createTaskDto.teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    if (!team.members.some((member) => member.id === userId)) {
      throw new ForbiddenException('You are not a member of this team');
    }

    // 檢查父任務
    let parentTask: Task | null = null;
    if (createTaskDto.parentTaskId) {
      parentTask = await this.findOne(createTaskDto.parentTaskId, userId);
      if (!parentTask) {
        throw new NotFoundException('Parent task not found');
      }
      if (parentTask.team.id !== team.id) {
        throw new ForbiddenException('Parent task must be in the same team');
      }
    }

    // 檢查被指派者是否為團隊成員
    let assignee: User | null = null;
    if (createTaskDto.assigneeId) {
      if (!team.members.some(member => member.id === createTaskDto.assigneeId)) {
        throw new ForbiddenException('Assignee must be a team member');
      }
      assignee = await this.usersService.findOneById(createTaskDto.assigneeId);
      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }
    }

    // 檢查關注者是否都是團隊成員
    const watchers: User[] = [];
    if (createTaskDto.watcherIds?.length) {
      for (const watcherId of createTaskDto.watcherIds) {
        if (!team.members.some(member => member.id === watcherId)) {
          throw new ForbiddenException(`Watcher with ID ${watcherId} must be a team member`);
        }
        const watcher = await this.usersService.findOneById(watcherId);
        if (!watcher) {
          throw new NotFoundException(`Watcher with ID ${watcherId} not found`);
        }
        watchers.push(watcher);
      }
    }

    // 創建任務實體
    const task = new Task();
    task.title = createTaskDto.title;
    task.description = createTaskDto.description || '';
    task.status = TaskStatus.TODO;
    task.team = team;
    task.creator = await this.usersService.findOneById(userId);

    if (parentTask) {
      task.parentTask = parentTask;
    }
    if (assignee) {
      task.assignee = assignee;
    }
    if (watchers.length > 0) {
      task.watchers = watchers;
    }

    return this.taskRepository.save(task);
  }

  async findAll(userId: number, query: FindTasksDto): Promise<Task[]> {
    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.team', 'team')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.creator', 'creator')
      .leftJoinAndSelect('task.watchers', 'watchers')
      .leftJoinAndSelect('task.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'commentUser')
      .leftJoinAndSelect('task.parentTask', 'parentTask')
      .leftJoinAndSelect('task.subtasks', 'subtasks')
      .leftJoinAndSelect('subtasks.assignee', 'subtaskAssignee');

    // 基本條件：用戶必須是創建者、執行者或關注者
    queryBuilder.where(
      new Brackets((qb) => {
        qb.where('task.creator.id = :userId', { userId })
          .orWhere('task.assignee.id = :userId', { userId })
          .orWhere('watchers.id = :userId', { userId });
      }));

    // 時間範圍篩選
    if (query.startDate) {
      queryBuilder.andWhere('task.createdAt >= :startDate', {
        startDate: new Date(query.startDate)
      });
    }

    if (query.endDate) {
      queryBuilder.andWhere('task.createdAt <= :endDate', {
        endDate: new Date(query.endDate)
      });
    }

    // 創建者篩選
    if (query.creatorId) {
      queryBuilder.andWhere('task.creator.id = :creatorId', {
        creatorId: query.creatorId
      });
    }

    // 執行者篩選
    if (query.assigneeId) {
      queryBuilder.andWhere('task.assignee.id = :assigneeId', {
        assigneeId: query.assigneeId
      });
    }

    // 排序
    switch (query.sortBy) {
      case TaskSortField.ID:
        queryBuilder.orderBy('task.id', query.sortOrder);
        break;
      case TaskSortField.CREATED_AT:
        queryBuilder.orderBy('task.createdAt', query.sortOrder);
        break;
      case TaskSortField.DUE_DATE:
        queryBuilder.orderBy('task.dueDate', query.sortOrder);
        break;
      case TaskSortField.CREATOR:
        queryBuilder.orderBy('creator.name', query.sortOrder);
        break;
      default:
        queryBuilder.orderBy('task.createdAt', 'DESC');
    }
    return queryBuilder.getMany();
  }

  async findOne(id: number, userId: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: [
        'team',
        'team.members',
        'assignee',
        'creator',
        'watchers',
        'comments',
        'comments.user',
        'parentTask',
        'subtasks',
        'subtasks.assignee'
      ],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!task.team.members.some((member) => member.id === userId)) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number): Promise<Task> {
    const task = await this.findOne(id, userId);
    const team = await this.teamsService.findOne(task.team.id);

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // 檢查更新權限
    if (task.creator.id !== userId && task.assignee?.id !== userId) {
      throw new ForbiddenException('Only task creator or assignee can update the task');
    }

    // 更新指派者
    if (updateTaskDto.assigneeId) {
      if (!team.members.some(member => member.id === updateTaskDto.assigneeId)) {
        throw new ForbiddenException('Assignee must be a team member');
      }
      const assignee = await this.usersService.findOneById(updateTaskDto.assigneeId);
      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }
      task.assignee = assignee;
    }

    // 更新關注者
    if (updateTaskDto.watcherIds) {
      const watchers: User[] = [];
      for (const watcherId of updateTaskDto.watcherIds) {
        if (!team.members.some(member => member.id === watcherId)) {
          throw new ForbiddenException(`Watcher with ID ${watcherId} must be a team member`);
        }
        const watcher = await this.usersService.findOneById(watcherId);
        if (!watcher) {
          throw new NotFoundException(`Watcher with ID ${watcherId} not found`);
        }
        watchers.push(watcher);
      }
      task.watchers = watchers;
    }

    // 更新基本欄位
    if (updateTaskDto.title) {
      task.title = updateTaskDto.title;
    }
    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description;
    }

    task.updatedAt = new Date();

    return this.taskRepository.save(task);
  }

  async remove(id: number, userId: number): Promise<void> {
    const task = await this.findOne(id, userId);

    // 檢查刪除權限
    if (task.creator.id !== userId) {
      throw new ForbiddenException('Only task creator can delete the task');
    }

    // 如果是父任務，會自動刪除所有子任務（通過 cascade）
    await this.taskRepository.remove(task);
  }

  async updateStatus(id: number, status: TaskStatus, userId: number): Promise<Task> {
    const task = await this.findOne(id, userId);

    // 檢查權限
    if (task.assignee && task.assignee.id !== userId) {
      throw new ForbiddenException('Only task assignee can update the status');
    }

    // 如果這是子任務，且狀態改為完成
    if (task.parentTask && status === TaskStatus.DONE) {
      // 檢查所有兄弟任務是否也都完成了
      const siblings = await this.taskRepository.find({
        where: { parentTask: { id: task.parentTask.id } }
      });

      const allSiblingsCompleted = siblings.every(
        sibling => sibling.id === task.id || sibling.status === TaskStatus.DONE
      );

      // 如果所有子任務都完成了，自動完成父任務
      if (allSiblingsCompleted) {
        const parentTask = await this.findOne(task.parentTask.id, userId);
        parentTask.status = TaskStatus.DONE;
        await this.taskRepository.save(parentTask);
      }
    }

    // 如果這是父任務，不允許手動完成
    if (task.subtasks?.length > 0 && status === TaskStatus.DONE) {
      const hasIncompleteSubtasks = task.subtasks.some(
        subtask => subtask.status !== TaskStatus.DONE
      );
      if (hasIncompleteSubtasks) {
        throw new ForbiddenException(
          'Cannot complete parent task until all subtasks are completed'
        );
      }
    }

    task.status = status;
    task.updatedAt = new Date();

    return this.taskRepository.save(task);
  }

  async findByTeam(teamId: number, userId: number): Promise<Task[]> {
    const team = await this.teamsService.findOne(teamId);

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (!team.members.some(member => member.id === userId)) {
      throw new ForbiddenException('You are not a member of this team');
    }

    return this.taskRepository.find({
      where: { team: { id: teamId } },
      relations: [
        'assignee',
        'creator',
        'watchers',
        'comments',
        'parentTask',
        'subtasks'
      ],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findAssignedTasks(userId: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: { assignee: { id: userId } },
      relations: ['team', 'creator', 'comments'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findCreatedTasks(userId: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: { creator: { id: userId } },
      relations: ['team', 'assignee', 'comments'],
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
