import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { User } from '@/users/model/user.entity';
import { Team } from '@/teams/model/team.entity';
import { Comment } from '@/comments/model/comment.entity';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

@Entity()
export class Task {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description: string = '';

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus = TaskStatus.TODO;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority = TaskPriority.MEDIUM;

  @Column({ type: 'timestamp' })
  dueDate: Date = new Date();

  @ManyToOne(() => User, (user) => user.assignedTasks)
  assignee!: User;

  @ManyToOne(() => User, (user) => user.createdTasks)
  creator!: User;

  @ManyToOne(() => Team, (team) => team.tasks)
  team!: Team;

  @OneToMany(() => Comment, (comment) => comment.task)
  comments?: Comment[];

  @ManyToMany(() => User)
  @JoinTable()
  watchers: User[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @ManyToOne(() => Task, (task) => task.subtasks, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_task_id' })
  parentTask?: Task;

  @OneToMany(() => Task, (task) => task.parentTask)
  subtasks: Task[];

  calculateProgress(): number {
    if (!this.subtasks || this.subtasks.length === 0) {
      return this.status === TaskStatus.DONE ? 100 : 0;
    }

    const completedSubtasks = this.subtasks.filter(
      subtask => subtask.status === TaskStatus.DONE
    ).length;

    return Math.round((completedSubtasks / this.subtasks.length) * 100);
  }
}
