import { JSDOM } from "jsdom";
import Crawler from "./crawler_interface";
import { ScrapeData } from "../types/crawlerTypes";

class RapplerCrawler implements Crawler {
    publication = "rappler";
    url = "http://www.rappler.com";

    getArticleBody(article: HTMLElement) {
        if (!article) return;

        const articleBody = article.querySelector(".post-single__content");
        if (!articleBody) return;

        const rawBody = articleBody.outerHTML;
        let parsedBody = "";
        articleBody.querySelectorAll("p").forEach((paragraph) => {
            parsedBody += paragraph.textContent;
        });

        return {
            rawBody,
            parsedBody,
        };
    }

    getArticlePublishedDate(article: HTMLElement) {
        const datePublishedElement: HTMLTimeElement | null =
            article.querySelector("time.post__timeago");
        if (!datePublishedElement) {
            console.error("No publish date");
            return;
        }

        const datePublished = new Date(datePublishedElement.dateTime);
        return datePublished;
    }

    scrape(htmlBody: string): ScrapeData | undefined {
        const document = new JSDOM(htmlBody).window.document;
        const titleElement = document.querySelector("h1.post-single__title");
        if (!titleElement) return;

        const title = titleElement.textContent!;
        const articleContainer = titleElement.closest("article");
        if (!articleContainer) {
            console.error("Got title but no article parent");
            return;
        }

        const articleBody = this.getArticleBody(articleContainer);
        if (!articleBody) {
            console.error("Got title but no article parent");
            return;
        }

        const content = articleBody.parsedBody;
        const rawContent = articleBody.rawBody;

        const date_publish = this.getArticlePublishedDate(articleContainer);
        if (!date_publish) {
            console.error("Got title but no date publish");
            return;
        }

        return {
            title,
            content,
            rawContent,
            date_publish,
        };
    }
}

export { RapplerCrawler };
