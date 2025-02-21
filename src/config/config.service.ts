import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class configService {
  constructor(private configService: ConfigService) { }

  getJwtSecret() {
    return this.configService.get<string>('JWT_SECRET');
  }

  getJwtExpiration() {
    return this.configService.get<string>('JWT_EXPIRATION');
  }

  public isProduction() {
    const mode = this.configService.get<string>('MODE', 'DEV');
    return mode != 'DEV';
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('POSTGRES_HOST') ?? 'localhost',
      port: parseInt(this.configService.get<string>('POSTGRES_PORT') ?? '5432'),
      username: this.configService.get<string>('POSTGRES_USER'),
      password: this.configService.get<string>('POSTGRES_PASSWORD'),
      database: this.configService.get<string>('POSTGRES_DATABASE'),
      entities: ['**/*.entity{.ts,.js}'],
      migrationsTableName: 'migration',
      migrations: ['src/migration/*.ts'],
      ssl: this.isProduction(),
    };
  }
}
