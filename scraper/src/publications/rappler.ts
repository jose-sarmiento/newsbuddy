import { promises as fs } from "fs";
import RapplerScraper from "../scrapers/rappler";
import { ArticleT, PublicationI, ScraperI } from "../types";

async function appendJsonToFile(filename: string, data: object): Promise<void> {
    try {
        const jsonLine = JSON.stringify(data) + "\n";
        await fs.appendFile(filename, jsonLine);
    } catch (error) {
        console.error("Error appending to file:", error);
    }
}

class Rappler implements PublicationI {
    name = "rappler";
    displayName = "Rappler";
    baseUrl = "http://www.rappler.com";
    filename = "out.jsonl";
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

    async saveArticle(article: ArticleT) {
        await appendJsonToFile(this.filename, article);
    }

    getScraper(html: string, publication: PublicationI): ScraperI {
        return new RapplerScraper(html, publication);
    }

    getExistingUrls() {
        return {};
    }
}

export default Rappler;
