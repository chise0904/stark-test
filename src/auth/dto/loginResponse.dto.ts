import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    example: 1,
    description: 'User ID'
  })
  id: number;

  @ApiProperty({
    example: 'johndoe',
    description: 'Username'
  })
  username: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address'
  })
  email: string;
}
