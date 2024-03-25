import fs from "fs/promises";
import CrawlerFactory from "./crawlers/crawler_factory";
import { Crawler } from "./crawler";
import { utcToZonedTime, format } from "date-fns-tz";
import { Settings } from "./config/settings";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

(async () => {
    if (process.argv.length < 3) {
        console.log("No publication provided");
        process.exit(1);
    }

    if (process.argv.length > 3) {
        console.log("Too many arguments, supported 3");
        process.exit(1);
    }

    const publicationName = process.argv[2];
    const crawler = CrawlerFactory.createCrawler(publicationName);
    if (!crawler) {
        console.log("Publication not supported");
        process.exit(1);
    }

    console.log(`Started crawling ${crawler.publication}`);

    const currentDatePH = utcToZonedTime(new Date(), Settings.timezone);
    const startDateISO = format(currentDatePH, "yyyy-MM-dd'T'00:00:00XXX");
    const endDateISO = format(currentDatePH, "yyyy-MM-dd'T'23:59:59XXX");

    const crawlerObj = new Crawler(crawler);
    const pages = crawlerObj.crawlPage(startDateISO, endDateISO);

    // await fs.writeFile("./data.json", JSON.stringify(pages, null, 2), "utf-8");
})();
