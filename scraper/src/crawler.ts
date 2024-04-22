import {
    ArticleLinkT,
    ArticleT,
    DateInput,
    PublicationI,
    ScrapeUrls,
} from "./types";
import { isWithinElapsed, isWithinRange } from "./utils/dates";
import { normalizeUrl } from "./utils/urls";
import logger from "./config/logger";
import { randomDelay } from "./utils";

class Crawler {
    constructor(private publication: PublicationI) {}

    async run(dateInput: DateInput) {
        const scrapeUrls = this.publication.getExistingUrls();

        const urls = await this.crawl(
            this.publication.baseUrl,
            scrapeUrls,
            dateInput,
            1
        );

        return urls;
    }

    private async crawl(
        currentUrl: string,
        scrapeUrls: ScrapeUrls,
        dateInput: DateInput,
        depth: number
    ) {
        if (depth === 10) return scrapeUrls;
        const normalizeCurrentUrl = normalizeUrl(currentUrl);
        if (!normalizeCurrentUrl) return scrapeUrls;

        if (normalizeCurrentUrl in scrapeUrls) {
            scrapeUrls[normalizeCurrentUrl]++;
            return scrapeUrls;
        }

        scrapeUrls[normalizeCurrentUrl] = 1;

        logger.info(`actively crawling ${currentUrl}`);

        try {
            const htmlString = await this.getHTMLBody(normalizeCurrentUrl);
            if (!htmlString) return scrapeUrls;

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
                        this.crawl(url, scrapeUrls, dateInput, depth + 1)
                    )
                );
            }
        } catch (err) {
            logger.info(`error in fetch: ${currentUrl} ${err}`);
        }

        return scrapeUrls;
    }

    private async getHTMLBody(url: string): Promise<string | undefined> {
        const maxAttempts = 3;
        const minDelay = 1000;
        const maxDelay = 5000;

        const userAgentList = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
        ];

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const randomUserAgent =
                userAgentList[Math.floor(Math.random() * userAgentList.length)];
            try {
                await randomDelay(minDelay, maxDelay);

                const response: Response = await fetch(url, {
                    headers: {
                        "User-Agent": randomUserAgent,
                    },
                });

                if (response.status > 399) {
                    logger.info(
                        `error in fetch: ${url} ${response.status} ${randomUserAgent}`
                    );
                    continue;
                }

                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("text/html")) {
                    logger.info(`expected text/html but got ${contentType}`);
                    continue;
                }

                const responseText = await response.text();
                return responseText;
            } catch (error) {
                if (attempt === maxAttempts) {
                    logger.error(`error fetching ${url}`);
                    return;
                }
            }
        }

        logger.error(`error fetching ${url}`);
        return;
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
                dateInput.elapsedInMinutes * 60
            );
        }
    }
}

export default Crawler;
