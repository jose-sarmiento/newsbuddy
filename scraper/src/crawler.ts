import { promises as fs } from "fs";

import {
    ArticleLinkT,
    ArticleT,
    DateInput,
    PublicationI,
    ScrapeUrls,
    ScraperI,
} from "./types";
import {
    checkPublishedDate,
    isWithinElapsed,
    isWithinRange,
} from "./utils/dates";
import { normalizeUrl } from "./utils/urls";

class Crawler {
    constructor(private publication: PublicationI) {}

    async run(dateInput: DateInput) {
        const scrapeUrls = this.publication.getExistingUrls();

        const urls = await this.crawl(
            this.publication.baseUrl,
            scrapeUrls,
            dateInput,
            1,
            this.publication.baseUrl
        );

        return urls;
    }

    private async crawl(
        currentUrl: string,
        scrapeUrls: ScrapeUrls,
        dateInput: DateInput,
        depth: number,
        parent: string
    ) {
        if (depth === 10) return scrapeUrls;
        const normalizeCurrentUrl = normalizeUrl(currentUrl);
        if (!normalizeCurrentUrl) return scrapeUrls;

        if (normalizeCurrentUrl in scrapeUrls) {
            scrapeUrls[normalizeCurrentUrl]++;
            return scrapeUrls;
        }

        scrapeUrls[normalizeCurrentUrl] = 1;

        console.log(
            `Depth: ${depth}, Parent: ${parent}, CHild: actively crawling ${currentUrl}`
        );

        try {
            const htmlString = await this.getHTMLBody(normalizeCurrentUrl);
            if (!htmlString) return;

            const scraper = this.publication.getScraper(
                htmlString,
                this.publication
            );

            const articles = scraper.scrapeArticles(normalizeCurrentUrl);

            if (!articles || articles.length === 0) return scrapeUrls;

            const hasArticlesAndLatest = articles.filter((article) =>
                this.checkDate(article, dateInput)
            );

            // if there is article and published date is out of range return
            if (hasArticlesAndLatest.length === 0) return scrapeUrls;

            const mainArticle = articles.find(
                (article): article is ArticleT => {
                    return "title" in article;
                }
            );

            let nextUrls = [...new Set(scraper.scrapeUrls())];

            if (mainArticle) {
                this.publication.saveArticle(mainArticle);
                const indexOfMainArticle = nextUrls.indexOf(
                    mainArticle.articleUrl
                );
                if (indexOfMainArticle > -1) {
                    nextUrls.splice(indexOfMainArticle, 1);
                }
            }

            if (articles) {
                const outdatedAricles = articles
                    .filter((article) => !this.checkDate(article, dateInput))
                    .map((el) => el.articleUrl);

                if (outdatedAricles.length > 0) {
                    nextUrls = nextUrls.filter(
                        (url) => !outdatedAricles.includes(url)
                    );
                }
            }

            if (nextUrls.length > 0) {
                await Promise.all(
                    nextUrls.map((url) =>
                        this.crawl(
                            url,
                            scrapeUrls,
                            dateInput,
                            depth + 1,
                            currentUrl
                        )
                    )
                );
            }
        } catch (err) {
            console.log(`error in fetch: ${currentUrl} ${err}`);
        }

        return scrapeUrls;
    }

    private async getHTMLBody(url: string): Promise<string | undefined> {
        try {
            const response: Response = await fetch(url);
            if (response.status > 399) {
                console.log(`error in fetch: ${url} ${response.status}`);
                return;
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("text/html")) {
                console.log(`expected text/html but got ${contentType}`);
                return;
            }

            const responseText = await response.text();
            return responseText;
        } catch (error) {
            console.error(error);
            return;
        }
    }

    private checkDate(article: ArticleT | ArticleLinkT, dateInput: DateInput) {
        if (dateInput.type === "range") {
            return isWithinRange(
                article.datePublished.toISOString(),
                dateInput.startDate,
                dateInput.endDate
            );
        } else {
            return isWithinElapsed(
                article.datePublished.toISOString(),
                dateInput.elapsedInMinutes
            );
        }
    }
}

export default Crawler;
