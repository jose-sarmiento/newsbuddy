import { Redis } from "ioredis";
import { connectRedis } from "../config/redis";

class BasePublication {
    public redis: Redis | undefined;
    constructor() {
        this.init();
    }

    private async init() {
        this.redis = await connectRedis();
    }

    async closeConnections() {
        await this.redis?.quit();
    }
}

export default BasePublication;
