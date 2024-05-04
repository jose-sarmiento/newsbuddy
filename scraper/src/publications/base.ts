// import { Redis } from "ioredis";
import { connectRedis } from "../db/redis";

class BasePublication {
    public redis: any;
    constructor() {
        this.init();
    }

    private async init() {
        this.redis = await connectRedis();
    }
}

export default BasePublication;
