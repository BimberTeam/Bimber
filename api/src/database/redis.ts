import redis, { RedisClient } from "redis";
export let redisClient: RedisClient;


export const initializeRedisClient = () => {
    redisClient = redis.createClient({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
        password: process.env.REDIS_PASSWORD,
    });
    redisClient.on("error", (error) => console.log(error));
};
