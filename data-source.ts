import { DataSource, DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import { registerAs } from '@nestjs/config';

const dbConfig = {
  synchronize: false,
  migrations: ['migrations/*{.ts,.js}'],
};

dotenvConfig({ path: `.env.${process.env.NODE_ENV}` });

switch (process.env.NODE_ENV) {
  case 'development':
    Object.assign(dbConfig, {
      type: 'sqlite',
      database: process.env.DB_NAME,
      entities: ['dist/**/*.entity{.ts,.js}'],
    });
    break;
  case 'test':
    Object.assign(dbConfig, {
      type: 'sqlite',
      database: process.env.DB_NAME,
      entities: ['**/*.entity{.ts,.js}'],
      migrationsRun: true,
    });
    break;
  case 'production':
    Object.assign(dbConfig, {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: ['dist/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      ssl: {
        rejectUnauthorized: false,
      },
    });
    break;
  default:
    throw new Error('Unknown NODE_ENV');
}

export const typeormConfig = registerAs('typeorm', () => dbConfig);

export default new DataSource(dbConfig as DataSourceOptions);
