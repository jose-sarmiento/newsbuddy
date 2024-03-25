import { JSDOM } from "jsdom";
import CrawlerInterface from "./crawlers/crawler_interface";
import { zonedTimeToUtc } from "date-fns-tz";
import { parseISO, isWithinInterval } from "date-fns";
import { Settings } from "./config/settings";
import { ScrapeData } from "./types/crawlerTypes";
import { BaseCrawler } from "./crawlers/base";

class Crawler extends BaseCrawler {
    constructor(private pubCrawler: CrawlerInterface) {
        super();
    }

    crawlPage(startDate: string, endDate: string) {
        const urls = this.crawl(
            this.pubCrawler.url,
            this.pubCrawler.url,
            {},
            startDate,
            endDate
        );
        return urls;
    }

    private async crawl(
        baseUrl: string,
        currentUrl: string,
        pages: { [key: string]: number },
        startDate: string,
        endDate: string
    ) {
        const baseUrlObj = new URL(baseUrl);
        const currentUrlObj = new URL(currentUrl);

        if (baseUrlObj.hostname !== currentUrlObj.hostname) {
            return pages;
        }

        const normalizeCurrentUrl = this.normalizeUrl(currentUrl);
        if (normalizeCurrentUrl in pages) {
            pages[normalizeCurrentUrl]++;
            return pages;
        }

        pages[normalizeCurrentUrl] = 1;

        try {
            const response: Response = await fetch(currentUrl);
            if (response.status > 399) {
                console.log(`error in fetch: ${currentUrl} ${response.status}`);
                return pages;
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("text/html")) {
                console.log(`expected text/html but got ${contentType}`);
                return pages;
            }

            const htmlBody = await response.text();
            
            const hasArticlesAndLatest = this.pubCrawler.checkArticleExistence(htmlBody, startDate, endDate);
            
            if (!hasArticlesAndLatest) return pages;
            console.log(`actively crawling: ${currentUrl}`);
            
            let data = this.pubCrawler.scrape(htmlBody);
            if (data) {
                const isWithin = this.checkPublishedDate(
                    data.date_publish,
                    startDate,
                    endDate
                );
                if (!isWithin) {
                    console.log("Got an article but not in given range");
                    return pages;
                }
                this.save(data);
            }

            const next_urls = this.getUrlsFromHtml(htmlBody, baseUrl);
            const pubHost = new URL(baseUrl).host
            const filteredUrls = next_urls.filter(url => url.includes(pubHost))
            for (const next_url of filteredUrls) {
                pages = await this.crawl(
                    baseUrl,
                    next_url,
                    pages,
                    startDate,
                    endDate
                );
            }
        } catch (err) {
            console.log(`error in fetch: ${currentUrl} ${err}`);
        }

        return pages;
    }

    getUrlsFromHtml(htmlBody: string, baseUrl: string) {
        const dom: JSDOM = new JSDOM(htmlBody);
        const links = dom.window.document.querySelectorAll("a");

        const urls = [];
        for (const link of links) {
            if (link.href.startsWith("/")) {
                try {
                    const urlObj = new URL(`${baseUrl}${link.href}`);
                    urls.push(urlObj.href);
                } catch (error: unknown) {
                    if (error instanceof Error) {
                        console.error(`Invalid URL: ${error.message}`);
                    } else {
                        console.error(`Invalid URL: ${error}`);
                    }
                }
            }
            try {
                urls.push(link.href);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error(`Invalid URL: ${error.message}`);
                } else {
                    console.error(`Invalid URL: ${error}`);
                }
            }
        }

        return urls;
    }

    normalizeUrl(url: string) {
        const urlObj = new URL(url);
        const cleanedUrl = `${urlObj.host}${urlObj.pathname}`;
        if (cleanedUrl.length > 0 && cleanedUrl.slice(-1) === "/") {
            return cleanedUrl.slice(0, -1);
        }

        return cleanedUrl;
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
}

export { Crawler };
