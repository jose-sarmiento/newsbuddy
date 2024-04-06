import fs from "fs/promises";
import Registry from "./registry";
import Rappler from "./publications/rappler";
import { extractCommandLineArgs } from "./utils/cli";
import Crawler from "./crawler";
import logger from "./config/logger";

function registerPublications() {
    Registry.registerPublication("rappler", Rappler);
}

async function main() {
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
    const _ = await crawlerObj.run(inputData.dateInput);
    // can be use to report which urls have been crawled and how many times they have been crawled
    // await fs.writeFile("./data.json", JSON.stringify(pages));

    Publication.closeConnections();
}

main();
