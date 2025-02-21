import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Team } from '@/teams/model/team.entity';
import { Task } from '@/tasks/model/task.entity';
import { Comment } from '@/comments/model/comment.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Exclude()
  @Column()
  password!: string;

  @Exclude()
  @Column()
  salt: string;

  @ManyToMany(() => Team, (team) => team.members)
  teams!: Team[];

  @OneToMany(() => Task, (task) => task.assignee)
  assignedTasks?: Task[];

  @OneToMany(() => Task, (task) => task.creator)
  createdTasks?: Task[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}
