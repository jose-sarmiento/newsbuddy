import "dotenv/config";

import logger from "./config/logger";
import { closeRedis, connectRedis } from "./db/redis";
import { News } from "./models/news";
import { connectMongo } from "./db/mongoose_connect";
import { Settings } from "./config/settings";
import mongoose from "mongoose";
import { connectElasticsearch } from "./db/es";
import { ArticleT } from "./types";

async function run() {
    connectMongo();
    const esClient = connectElasticsearch();
    const redis = await connectRedis();

    const articles = await redis.lrange(Settings.articleQueueKey, 1, 1);
    if (!articles || articles.length === 0) return;

    const newsArticle: ArticleT | undefined = JSON.parse(articles[0]);
    if (!newsArticle) {
        logger.info(`Cannot parse article, got ${articles}`);
        return;
    }

    logger.info(`Processing url: ${newsArticle.articleUrl}`);

    const news = await News.create(newsArticle);

    await esClient.index({
        index: "articles",
        document: news.toJSON(),
    });

    logger.info(`Success processing url: ${news.articleUrl}`);
}

run()
    .catch((error) => logger.error(error))
    .finally(async () => {
        await closeRedis();
        await mongoose.disconnect();
    });
