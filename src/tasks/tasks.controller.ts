import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '@/auth/guard/jwt.guard';
import { GetUser } from '@/auth/decorators/get-user.decorator';
import { TaskStatus } from './model/task.entity';
import { FindTasksDto } from './dto/find-task.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: CreateTaskDto })
  create(@Body() createTaskDto: CreateTaskDto, @GetUser('id') userId: number) {
    return this.tasksService.create(createTaskDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks for user' })
  @ApiResponse({ status: 200, description: 'Return all tasks' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ type: FindTasksDto })
  findAll(@GetUser('id') userId: number, @Query() query: FindTasksDto) {
    return this.tasksService.findAll(userId, query);
  }

  @Get('team/:teamId')
  @ApiOperation({ summary: 'Get tasks by team' })
  @ApiResponse({ status: 200, description: 'Return team tasks' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'teamId', type: 'number', description: 'Team ID' })
  findByTeam(
    @Param('teamId', ParseIntPipe) teamId: number,
    @GetUser('id') userId: number,
  ) {
    return this.tasksService.findByTeam(teamId, userId);
  }

  @Get('assigned')
  @ApiOperation({ summary: 'Get tasks assigned to user' })
  @ApiResponse({ status: 200, description: 'Return assigned tasks' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAssignedTasks(@GetUser('id') userId: number) {
    return this.tasksService.findAssignedTasks(userId);
  }

  @Get('created')
  @ApiOperation({ summary: 'Get tasks created by user' })
  @ApiResponse({ status: 200, description: 'Return created tasks' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findCreatedTasks(@GetUser('id') userId: number) {
    return this.tasksService.findCreatedTasks(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: 200, description: 'Return the task' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiParam({ name: 'id', type: 'number', description: 'Task ID' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ) {
    return this.tasksService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiParam({ name: 'id', type: 'number', description: 'Task ID' })
  @ApiBody({ type: UpdateTaskDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser('id') userId: number,
  ) {
    return this.tasksService.update(id, updateTaskDto, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  @ApiResponse({ status: 200, description: 'Task status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiParam({ name: 'id', type: 'number', description: 'Task ID' })
  @ApiBody({ schema: { properties: { status: { type: 'string', enum: Object.values(TaskStatus) } } } })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: TaskStatus,
    @GetUser('id') userId: number,
  ) {
    return this.tasksService.updateStatus(id, status, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiParam({ name: 'id', type: 'number', description: 'Task ID' })
  remove(@Param('id', ParseIntPipe) id: number, @GetUser('id') userId: number) {
    return this.tasksService.remove(id, userId);
  }
}
