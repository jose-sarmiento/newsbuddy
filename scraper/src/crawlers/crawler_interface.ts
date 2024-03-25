import { ScrapeData } from "../types/crawlerTypes";

interface Crawler {
    publication: string;
    url: string;

    scrape: (htmlBody: string) => ScrapeData | undefined;

    checkArticleExistence: (htmlBody: string, minDate: string, maxDate: string) => boolean;
}

export default Crawler;
