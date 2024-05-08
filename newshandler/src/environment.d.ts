declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production";
            MONGO_URI: string;
            REDIS_HOST: string;
            REDIS_PORT: number;
            REDIS_DATABASE: number;
            LLM_API: string;
            ES_URI: string;
        }
    }
}

export {};
