import { ScrapeData } from "../types/crawlerTypes";

interface Crawler {
    publication: string;
    url: string;

    scrape: (htmlBody: string) => ScrapeData | undefined;
}

export default Crawler;
