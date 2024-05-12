import logger from "../config/logger";

const { Client } = require("@elastic/elasticsearch");

export function connectElasticsearch() {
    logger.debug("Connecting to elasticsearch");
    const client = new Client({
        node: process.env.ES_URI,
        maxRetries: 5,
        requestTimeout: 60000,
        sniffOnStart: true,
    });
    logger.debug("Elasticsearch connected");
    return client;
}
