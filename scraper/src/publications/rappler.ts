import RapplerScraper from "../scrapers/rappler";
import { ArticleT, PublicationI, ScraperI } from "../types";
import BasePublication from "./base";

class Rappler extends BasePublication implements PublicationI {
    name = "rappler";
    displayName = "Rappler";
    baseUrl = "https://www.rappler.com";
    articlesQueue: string;
    scrapedUrlsKey: string;

    excluded = [
        "https://www.rappler.com/offers",
        "https://www.rappler.com/about-plus-membership-program",
        "https://www.rappler.com/about/the-people-behind-rappler",
        "https://www.rappler.com/board-of-directors",
        "https://www.rappler.com/section/about",
        "https://www.rappler.com/about",
        "https://www.rappler.com/about/mission-statement-journalism-communities-technology",
        "https://www.rappler.com/about/standards-guidelines-corrections-fact-check-content-comment-moderation",
        "https://www.rappler.com/about/guidelines-artificial-intelligence-usage-development",
        "https://www.rappler.com/about-rappler/about-us/21743-rappler-team",
        "https://www.rappler.com/about-rappler/about-us/1557-contact-us",
        "https://www.rappler.com/about/rappler-privacy-statement",
        "https://www.rappler.com/about/rappler-community-and-site-use-rules",
        "https://www.rappler.com/about/27506-community-guidelines",
    ];

    constructor() {
        super();
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
            day: "2-digit",
        });
        this.articlesQueue = `rappler:articles:${formattedDate
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/,/g, "")}`;
        this.scrapedUrlsKey = `rappler:article_urls:${formattedDate
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/,/g, "")}`;
    }

    async saveArticle(article: ArticleT) {
        const exists = this.redis?.sismember(
            this.scrapedUrlsKey,
            article.articleUrl
        );
        if (!exists) {
            this.redis?.sadd(this.scrapedUrlsKey, article.articleUrl);
            this.redis?.lpush(this.articlesQueue, JSON.stringify(article));
        }
    }

    getScraper(html: string, publication: PublicationI): ScraperI {
        return new RapplerScraper(html, publication);
    }

    getExistingUrls() {
        return {};
    }
}

export default Rappler;
