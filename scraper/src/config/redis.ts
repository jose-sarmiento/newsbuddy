import { Redis } from "ioredis";

async function connectRedis() {
    return await new Redis({
        port: 6379,
        host: "redis",
        db: 0,
    });
}

export { connectRedis };
