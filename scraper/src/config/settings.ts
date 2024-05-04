import { SettingsT } from "../types";

export const Settings: SettingsT = {
    timezone: "Asia/Manila",

    redis_host: process.env.REDIS_HOST!,
    redis_port: Number(process.env.REDIS_PORT)!,
    redis_database: Number(process.env.REDIS_DATABASE)!,
};
