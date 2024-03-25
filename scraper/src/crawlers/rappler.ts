import { JSDOM } from "jsdom";
import Crawler from "./crawler_interface";
import { ScrapeData } from "../types/crawlerTypes";
import { zonedTimeToUtc } from "date-fns-tz";
import { parseISO, isWithinInterval } from "date-fns";
import { Settings } from "../config/settings";

// SEPARATE CLASS FOR PUBLICATION AND CRAWLER/SCRAPER
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
    
    getArticleCategory(article: HTMLElement) {
        if (!article) return;

        const articleCategory = article.querySelector(".post-single__category");
        if (!articleCategory) return;

        return articleCategory.textContent
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

        const articleCategory = this.getArticleCategory(articleContainer);

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

    private checkPublishedDate(
        datePublished: Date,
        startDate: string,
        endDate: string
    ) {
        const dateStartUTC = zonedTimeToUtc(
            parseISO(startDate),
            Settings.timezone
        );
        const dateEndUTC = zonedTimeToUtc(parseISO(endDate), Settings.timezone);

        return isWithinInterval(datePublished, {
            start: dateStartUTC,
            end: dateEndUTC,
        });
    }

    checkArticleExistence(htmlBody: string, minDate: string, maxDate: string) {
        const document = new JSDOM(htmlBody).window.document;
        const articles = document.querySelectorAll("article")

        if (articles.length == 0) return false

        for(let i=0; i < articles.length; i++) {
            let datePublished: Date | string | undefined = articles[i].querySelector("time")?.dateTime

            if (!datePublished) continue;

            try {
                datePublished = new Date(datePublished);
                if (this.checkPublishedDate(datePublished, minDate, maxDate)) return true;
            } catch (error) {
                continue;
            }
        }

        return false;
    }
}

export { RapplerCrawler };
