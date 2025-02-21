// src/comments/comments.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './model/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TasksService } from '@/tasks/tasks.service';
import { UsersService } from '@/users/users.service';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment)
        private commentRepository: Repository<Comment>,
        private readonly tasksService: TasksService,
        private readonly usersService: UsersService,
    ) { }

    async create(
        taskId: number,
        userId: number,
        createCommentDto: CreateCommentDto,
    ): Promise<Comment> {
        const task = await this.tasksService.findOne(taskId, userId);
        const user = await this.usersService.findOneById(userId);

        let parentComment: Comment | null = null;
        if (createCommentDto.parentCommentId) {
            parentComment = await this.commentRepository.findOne({
                where: { id: createCommentDto.parentCommentId },
            });
            if (!parentComment) {
                throw new NotFoundException('Parent comment not found');
            }
        }

        const comment = new Comment();
        comment.content = createCommentDto.content;
        comment.task = task;
        comment.user = user;
        if (parentComment) {
            comment.parentComment = parentComment;
        }

        return this.commentRepository.save(comment);
    }

    async findAllByTask(taskId: number, userId: number): Promise<Comment[]> {
        // 確保用戶有權限訪問該任務
        await this.tasksService.findOne(taskId, userId);

        return this.commentRepository.find({
            where: { task: { id: taskId } },
            relations: ['user', 'parentComment'],
            order: { createdAt: 'DESC' },
        });
    }

    async remove(id: number, userId: number): Promise<void> {
        const comment = await this.commentRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        if (comment.user.id !== userId) {
            throw new ForbiddenException('Only comment creator can delete the comment');
        }

        await this.commentRepository.remove(comment);
    }
}
