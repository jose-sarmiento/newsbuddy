import Crawler from "./crawler_interface";
import { RapplerCrawler } from "./rappler";

class CrawlerFactory {
    private static crawlers: { [key: string]: new () => Crawler } = {
        "rappler": RapplerCrawler,
    };

    static createCrawler(publication: string): Crawler | null {
        const CrawlerClass = CrawlerFactory.crawlers[publication];
        if (CrawlerClass) {
            return new CrawlerClass();
        }
        return null; // Handle unsupported publication
    }
}

export default CrawlerFactory