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
    excluded = [];

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
