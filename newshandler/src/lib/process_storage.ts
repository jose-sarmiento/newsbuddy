import { MongoBulkWriteError } from "mongodb";
import logger from "../config/logger";
import { AricleWIthId, ArticleT, DBArticle } from "../types";
import { connectMongo } from "../db/mongo";

export async function saveMongo(
    articles: ArticleT[]
): Promise<AricleWIthId[] | undefined> {
    let articlesColl;
    try {
        logger.info(`mongodb: inserting ${articles.length} articles`);
        const client = await connectMongo();
        articlesColl = await client?.db("newsbuddy").collection("articles");
        const insertResult = await articlesColl?.insertMany(articles, {
            ordered: false,
        });
        logger.info(`mongodb: ${articles.length} articles inserted`);

        const insertedIds = insertResult?.insertedIds;
        if (!insertedIds) return [];

        const insertedArticles: AricleWIthId[] = articles.map(
            (article, index) => ({ ...article, _id: insertedIds[index] })
        );
        return insertedArticles;
    } catch (error: any) {
        if (error instanceof MongoBulkWriteError) {
            const insertedIds = Object.values(error.result.insertedIds);
            if (insertedIds && insertedIds.length > 0) {
                if (!articlesColl) return;
                const articles = (await articlesColl
                    .find({ _id: { $in: insertedIds } })
                    .toArray()) as AricleWIthId[];
                return articles.map((article) => ({ ...article }));
            }
        } else {
            logger.info(`mongodb: insert failed ${error?.message}`);
        }
    }
}

export async function saveES(articles: AricleWIthId[]) {
    try {
        logger.info(`elasticsearch: inserting ${articles.length} articles`);
        console.log(articles);
        // const client = await connectMongo();
        // const articlesColl = await client
        //     ?.db("newsbuddy")
        //     .collection("articles");
        // const insertResult = await articlesColl?.insertMany(articles);
        // logger.info(`mongodb: ${articles.length} articles inserted`);

        // const insertedIds = insertResult?.insertedIds;
        // if (!insertedIds) return [];

        // return articles.map((article, index) => ({...article, id: insertedIds[index]}));
    } catch (error: any) {
        logger.info(`elasticsearch: insert failed ${error?.message}`);
    }
}
