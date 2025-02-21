import {
  IsString,
  IsEnum,
  IsDateString,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '../model/task.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Implement user authentication',
    description: 'The title of the task'
  })
  @IsString()
  title!: string;

  @ApiPropertyOptional({
    example: 'Implement JWT-based authentication system with refresh tokens',
    description: 'Detailed description of the task',
    default: ''
  })
  @IsString()
  @IsOptional()
  description?: string = '';

  @ApiPropertyOptional({
    enum: TaskStatus,
    example: TaskStatus.TODO,
    description: 'Current status of the task'
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
    description: 'Priority level of the task'
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({
    example: '2024-02-21T10:00:00Z',
    description: 'Due date for the task',
    default: 'Current date/time'
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string = new Date().toISOString();

  @ApiPropertyOptional({
    example: 1,
    description: 'ID of the user assigned to this task',
    default: 0
  })
  @IsNumber()
  @IsOptional()
  assigneeId: number = 0;

  @ApiPropertyOptional({
    example: [1, 2, 3],
    description: 'Array of user IDs who are watching this task',
    type: [Number]
  })
  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  watcherIds?: number[];

  @ApiProperty({
    example: 1,
    description: 'ID of the team this task belongs to',
    default: 0
  })
  @IsNumber()
  teamId: number = 0;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID of the parent task if this is a subtask',
    nullable: true
  })
  @IsNumber()
  @IsOptional()
  parentTaskId?: number;
}
