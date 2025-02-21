import { IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum TaskSortField {
    ID = 'id',
    CREATED_AT = 'createdAt',
    DUE_DATE = 'dueDate',
    CREATOR = 'creator'
}

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC'
}

export class FindTasksDto {
    @ApiPropertyOptional({
        example: '2024-01-01T00:00:00Z',
        description: 'Filter tasks from this date',
        type: String
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({
        example: '2024-12-31T23:59:59Z',
        description: 'Filter tasks until this date',
        type: String
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({
        example: 1,
        description: 'Filter tasks by creator ID',
        type: Number
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    creatorId?: number;

    @ApiPropertyOptional({
        example: 2,
        description: 'Filter tasks by assignee ID',
        type: Number
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    assigneeId?: number;

    @ApiPropertyOptional({
        enum: TaskSortField,
        default: TaskSortField.CREATED_AT,
        example: TaskSortField.CREATED_AT,
        description: 'Field to sort tasks by'
    })
    @IsOptional()
    @IsEnum(TaskSortField)
    sortBy?: TaskSortField = TaskSortField.CREATED_AT;

    @ApiPropertyOptional({
        enum: SortOrder,
        default: SortOrder.DESC,
        example: SortOrder.DESC,
        description: 'Sort order (ascending or descending)'
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.DESC;
}
