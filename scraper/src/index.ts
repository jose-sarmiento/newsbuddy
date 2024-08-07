import "dotenv/config";

import fs from "fs/promises";
import Registry from "./registry";
import Rappler from "./publications/rappler";
import Crawler from "./crawler";
import logger from "./config/logger";
import { extractCommandLineArgs } from "./utils/cli";
import { closeRedis, connectRedis } from "./db/redis";

function registerPublications() {
    Registry.registerPublication("rappler", Rappler);
}

async function main() {
    try {
        await connectRedis();

        const inputData = extractCommandLineArgs(process.argv);
        if (!inputData) process.exit(1);

        registerPublications();

        const Publication = Registry.getPublication(process.argv[2].trim());
        if (!Publication) {
            logger.info("Publication not supported");
            process.exit(1);
        }

        logger.info(`Started crawling ${Publication.name}`);

        const crawlerObj = new Crawler(Publication);
        await crawlerObj.run(inputData.dateInput);
    } catch (error) {
        logger.error(error);
    } finally {
        await closeRedis();
    }
}

main();
