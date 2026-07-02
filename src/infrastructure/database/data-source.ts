import 'dotenv/config';
import { DataSource } from 'typeorm';

const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

const baseConfig = databaseUrl
  ? {
      url: databaseUrl,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME ?? 'sharedroute',
    };

export default new DataSource({
  type: 'postgres',
  ...baseConfig,
  entities: [isProduction ? 'dist/**/*.orm-entity.js' : 'src/**/*.orm-entity.ts'],
  migrations: [isProduction ? 'dist/infrastructure/database/migrations/*.js' : 'src/infrastructure/database/migrations/*.ts'],
  synchronize: false,
  logging: !isProduction,
});
