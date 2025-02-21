import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '@/auth/guard/jwt.guard';



@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) { }

  @Post()
  async create(@Body() createTeamDto: CreateTeamDto, @Req() req) {
    return this.teamsService.create(createTeamDto, req.user.id);
  }

  @Get()
  async findAll(@Req() req) {
    return this.teamsService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    return this.teamsService.findOne(+id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @Req() req,
  ) {
    return this.teamsService.update(+id, updateTeamDto, req.user.id);
  }

  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
    @Req() req,
  ) {
    return this.teamsService.addMember(+id, addMemberDto, req.user.id);
  }

  @Delete(':teamId/members/:memberId')
  async removeMember(
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @Req() req,
  ) {
    return this.teamsService.removeMember(+teamId, +memberId, req.user.id);
  }
}
