export interface RedisConfig {
  host: string;
  port: number;
  ttl: number;
}

export const redisConfig = (): { redis: RedisConfig } => ({
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    ttl: parseInt(process.env.REDIS_TTL ?? '300', 10),
  },
});
