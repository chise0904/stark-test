import { ApiProperty } from "@nestjs/swagger";
import { LoginResponseDto } from "../dto/loginResponse.dto";

export class UserInfo implements Pick<LoginResponseDto, 'email' | 'id' | 'username'> {
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

export class UserJwtResponse {
    @ApiProperty({
        type: UserInfo,
        description: 'User information'
    })
    user: Pick<LoginResponseDto, 'email' | 'id' | 'username'>;

    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT access token'
    })
    accessToken: string;
}
