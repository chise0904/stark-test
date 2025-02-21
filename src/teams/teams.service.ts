import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './model/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { UsersService } from '@/users/users.service';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    private readonly userService: UsersService,
  ) { }

  async create(createTeamDto: CreateTeamDto, userId: number): Promise<Team> {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const team = this.teamRepository.create({
      ...createTeamDto,
      members: [user],
    });

    return this.teamRepository.save(team);
  }

  async findAll(userId: number): Promise<Team[]> {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('Team not found');
    }

    console.log('user: ', user)

    return user.teams;
  }

  async findOne(id: number, userId?: number): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['members', 'tasks'],
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (!userId) {
      return team;
    }

    const isMember = team.members.some((member) => member.id === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this team');
    }

    return team;
  }

  async update(id: number, updateTeamDto: UpdateTeamDto, userId: number): Promise<Team> {
    const team = await this.findOne(id, userId);
    Object.assign(team, updateTeamDto);
    return this.teamRepository.save(team);
  }

  async addMember(id: number, addMemberDto: AddMemberDto, userId: number): Promise<Team> {
    const team = await this.findOne(id, userId);
    const userToAdd = await this.userService.findOne(addMemberDto.email);

    if (!userToAdd) {
      throw new NotFoundException('User not found');
    }

    if (team.members.some((member) => member.id === userToAdd.id)) {
      throw new ForbiddenException('User is already a member of this team');
    }

    team.members.push(userToAdd);
    return this.teamRepository.save(team);
  }

  async removeMember(teamId: number, memberUserId: number, userId: number): Promise<Team> {
    const team = await this.findOne(teamId, userId);
    team.members = team.members.filter((member) => member.id !== memberUserId);
    return this.teamRepository.save(team);
  }
}
