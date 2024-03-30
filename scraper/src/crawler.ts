import { promises as fs } from "fs";

import { ArticleT, PublicationI, ScrapeUrls } from "./types";
import { checkPublishedDate } from "./utils/dates";
import { normalizeUrl } from "./utils/urls";

class Crawler {
    constructor(private publication: PublicationI) {}

    async run(startDate: string, endDate: string) {
        const scrapeUrls = this.publication.getExistingUrls();

        const urls = await this.crawl(
            this.publication.baseUrl,
            scrapeUrls,
            startDate,
            endDate,
            1,
            this.publication.baseUrl
        );

        return urls;
    }

    private async crawl(
        currentUrl: string,
        scrapeUrls: ScrapeUrls,
        startDate: string,
        endDate: string,
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
                checkPublishedDate(article.datePublished, startDate, endDate)
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
                    .filter(
                        (article) =>
                            !checkPublishedDate(
                                article.datePublished,
                                startDate,
                                endDate
                            )
                    )
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
                            startDate,
                            endDate,
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
}

export default Crawler;
