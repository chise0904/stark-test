import { IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value as string)
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value as string)
  JWT_EXPIRATION!: string;
}
