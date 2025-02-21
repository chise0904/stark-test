import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { EnvironmentVariables } from './env.validation';
import { configService } from './config.service';

@Module({
  imports: [
    NestConfigModule.forRoot({
      validate: (config) => {
        const validatedConfig = Object.assign(
          new EnvironmentVariables(),
          config,
        );
        return validatedConfig;
      },
      isGlobal: true,
    }),
  ],
  providers: [configService],
  exports: [configService],
})
export class ConfigModule { }
