import { Redis } from "ioredis";
import logger from "../config/logger";
import { Settings } from "../config/settings";

const redisOptions = {
    host: Settings.redis_host,
    port: Settings.redis_port,
    db: Settings.redis_database,
};

let redisInstance: Redis | null = null;

async function connectRedis(): Promise<Redis> {
    try {
        if (!redisInstance) {
            logger.debug("Establishing connection with redis");
            redisInstance = await new Redis(redisOptions);
            redisInstance.on("error", (error) => {
                logger.error(`Redis connection error: ${error}`);
                redisInstance = null;
                throw error;
            });

            logger.debug("Redis connected");
        }
        return redisInstance;
    } catch (error) {
        logger.error(`Failed to establish Redis connection: ${error}`);
        redisInstance = null;
        throw error;
    }
}

async function closeRedis(): Promise<void> {
    try {
        if (redisInstance) {
            logger.debug("Closing redis connection");
            await redisInstance.quit();
            redisInstance = null;
        }
    } catch (error) {
        logger.error("Failed to close Redis connection: ", error);
    }
}

export { connectRedis, closeRedis };
