// src/comments/comments.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '@/auth/guard/jwt.guard';
import { GetUser } from '@/auth/decorators/get-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks/:taskId/comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new comment' })
    create(
        @Param('taskId', ParseIntPipe) taskId: number,
        @GetUser('id') userId: number,
        @Body() createCommentDto: CreateCommentDto,
    ) {
        return this.commentsService.create(taskId, userId, createCommentDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all comments for a task' })
    findAll(
        @Param('taskId', ParseIntPipe) taskId: number,
        @GetUser('id') userId: number,
    ) {
        return this.commentsService.findAllByTask(taskId, userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a comment' })
    remove(
        @Param('id', ParseIntPipe) id: number,
        @GetUser('id') userId: number,
    ) {
        return this.commentsService.remove(id, userId);
    }
}
