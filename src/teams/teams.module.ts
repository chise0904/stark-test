import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { Team } from './model/team.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsController } from './teams.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Team]), UsersModule],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule { }
