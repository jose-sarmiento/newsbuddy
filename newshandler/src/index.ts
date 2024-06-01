import "dotenv/config";

import logger from "./config/logger";
import { closeRedis, connectRedis } from "./db/redis";
import { News } from "./models/news";
import { connectMongo } from "./db/mongoose_connect";
import mongoose from "mongoose";
import { connectElasticsearch } from "./db/es";
import { ArticleT } from "./types";
import { Redis } from "ioredis";
import { generateSummary } from "./lib/summary";
import {
    ARTICLES_DONE_QUEUE,
    ARTICLES_FAILED_QUEUE,
    ARTICLES_PENDING_QUEUE,
    ARTICLES_PROCESSING_QUEUE,
} from "./constants";
import { MongoServerError } from "mongodb";

async function getItemFromQueue(
    redis: Redis,
    source: string,
    desination: string,
    timeout = 20
) {
    return await redis.brpoplpush(source, desination, timeout);
}

async function reQueue(redis: Redis, desination: string, element: string) {
    await redis.lpush(desination, element);
}

async function removeFromQueue(redis: Redis, source: string, element: string) {
    await redis.lrem(source, 1, element);
}

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function run() {
    let redis: Redis | undefined = undefined;

    connectMongo();
    redis = await connectRedis();
    const esClient = connectElasticsearch();
    let rawArticle;

    while (true) {
        try {
            rawArticle = await getItemFromQueue(
                redis,
                ARTICLES_PENDING_QUEUE,
                ARTICLES_PROCESSING_QUEUE
            );
          
            if (!rawArticle) {
                sleep(120);
                continue;
            }

            const newsArticle: ArticleT | undefined = JSON.parse(rawArticle);
            if (!newsArticle) {
                logger.info(`Cannot parse article, got ${rawArticle}`);
                await reQueue(redis, ARTICLES_FAILED_QUEUE, rawArticle);
                continue;
            }

            const exists = await News.findOne({
                articleUrl: newsArticle.articleUrl,
            });
            if (exists) {
                console.log("Article already exists")
                await removeFromQueue(
                    redis,
                    ARTICLES_PROCESSING_QUEUE,
                    rawArticle
                );
                continue;
            }

            logger.info(`Processing url: ${newsArticle.articleUrl}`);

            const summary = await generateSummary(newsArticle.content);
            if (!summary) {
                console.log("Failed on generating summary");
                await reQueue(redis, ARTICLES_FAILED_QUEUE, rawArticle);
                continue;
            }
            
            const news = await News.create({ ...newsArticle, summary });

            await esClient.index({
                index: "articles",
                document: news.toJSON(),
            });

            await removeFromQueue(redis, ARTICLES_PROCESSING_QUEUE, rawArticle);
            await reQueue(redis, ARTICLES_DONE_QUEUE, newsArticle.articleUrl);
            logger.info(`Success processing url: ${news.articleUrl}`);
        } catch (error) {
            if (rawArticle) {
                if (error instanceof Error && error.message.startsWith("E11000 duplicate key error")) {
                    console.log("Article already exists")
                    await removeFromQueue(
                        redis,
                        ARTICLES_PROCESSING_QUEUE,
                        rawArticle
                    );
                    continue;
                }
                redis.lpush("articles:failed", rawArticle);
            }
        }
    }
}

run().catch(error => console.log(error)).finally(async () => {
    await closeRedis();
    await mongoose.disconnect();
});
