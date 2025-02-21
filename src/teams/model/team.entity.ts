import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, JoinTable } from 'typeorm';
import { User } from '@/users/model/user.entity';
import { Task } from '@/tasks/model/task.entity';
// import { Task } from './task.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description: string = '';

  @ManyToMany(() => User, (user) => user.teams)
  @JoinTable()
  members!: User[];

  @OneToMany(() => Task, (task) => task.team)
  tasks!: Task[];
}
