import { MongoClient } from "mongodb";
import logger from "../config/logger";
import { Settings } from "../config/settings";

let mongoInstance: MongoClient | null = null;

async function connectMongo(): Promise<MongoClient> {
    try {
        if (mongoInstance) return mongoInstance;

        logger.debug("Establishing connection with mongo");
        console.log(Settings.mongo_uri);
        const client = new MongoClient(Settings.mongo_uri);
        mongoInstance = await client.connect();
        return mongoInstance;
    } catch (error) {
        logger.error(`Failed to establish Mongo connection: ${error}`);
        mongoInstance = null;
        throw error;
    }
}

async function closeMongo(): Promise<void> {
    try {
        if (!mongoInstance) return;

        logger.debug("Closing mongo connection");
        await mongoInstance.close();
    } catch (error) {
        logger.error("Failed to close Mongo connection: ", error);
    }
}

export { connectMongo, closeMongo };
