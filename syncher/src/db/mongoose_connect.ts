import mongoose from "mongoose";
import { Settings } from "../config/settings";
import logger from "../config/logger";

export function connectMongo() {
    mongoose.connect(Settings.mongo_uri).catch((error) => {
        logger.error(`Failed to establish mongo connection: ${error}`);
        throw error;
    });
}
