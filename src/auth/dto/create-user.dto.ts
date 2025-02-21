import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'User password - minimum 8 characters',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(60)
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'User name',
  })
  @IsString()
  @IsNotEmpty()
  username: string;
}

export type CreateUserRespDto = Pick<CreateUserDto, 'email' | 'username'>;
