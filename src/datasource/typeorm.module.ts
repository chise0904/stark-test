import { DataSource } from 'typeorm';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: DataSource,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        try {
          const dataSource = new DataSource({
            type: 'postgres',
            host: configService.get<string>('DATABASE_HOST', 'db'),
            port: configService.get<number>('DATABASE_PORT', 5432),
            username: configService.get<string>('POSTGRES_USER', 'postgres'),
            password: configService.get<string>('POSTGRES_PASSWORD', 'postgres'),
            database: configService.get<string>('POSTGRES_DB', 'test'),
            synchronize: configService.get<boolean>('DATABASE_SYNC', true),
            entities: [`${__dirname}/../**/**.entity{.ts,.js}`],
            // 額外建議的設定
            logging: configService.get<boolean>('DATABASE_LOGGING', false),
          });

          await dataSource.initialize();
          console.log('Database connected successfully');
          return dataSource;
        } catch (error) {
          console.error('Error connecting to database:', error);
          throw error;
        }
      },
    },
  ],
  exports: [DataSource],
})
export class TypeOrmModule { }
