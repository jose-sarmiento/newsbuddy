import { SettingsT } from "../types";

export const Settings: SettingsT = {
    timezone: "Asia/Manila",
    articleQueueKey: "articles",

    mongo_uri: process.env.MONGO_URI!,

    redis_host: process.env.REDIS_HOST!,
    redis_port: Number(process.env.REDIS_PORT)!,
    redis_database: Number(process.env.REDIS_DATABASE)!,
};
