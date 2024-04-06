import { JSDOM } from "jsdom";
import { normalizeUrl } from "../utils/urls";
import { ArticleLinkT, ArticleT, PublicationI, ScraperI } from "../types";
import BaseScraper from "./base";
import { checkPublishedDate } from "../utils/dates";

class RapplerScraper extends BaseScraper implements ScraperI {
    private document: Document;
    private articlesSelector = "article";
    private titleSelector = "h1.post-single__title";
    private contentSelector = ".post-single__content";
    private categorySelector = ".post-single__category";
    private imageSelector = ".post-single__image img";

    constructor(html: string, private publication: PublicationI) {
        super();
        this.document = new JSDOM(html).window.document;
        this.publication = publication;
    }

    scrapeTitle(article: Element) {
        const titleElement = article.querySelector(this.titleSelector);
        if (!titleElement) return;

        return titleElement.textContent || "";
    }

    scrapeContent(article: Element) {
        const articleBody = article.querySelector(this.contentSelector);
        if (!articleBody) return "";

        let parsedBody = "";
        articleBody.querySelectorAll("p").forEach((paragraph) => {
            parsedBody += paragraph.textContent;
        });

        return parsedBody;
    }

    scrapePublishedDate(article: Element) {
        const datePublishedElement = article.querySelector("time");
        if (!datePublishedElement) return;

        return new Date(datePublishedElement.dateTime);
    }

    scrapeImages(article: Element) {
        const articleImage = article.querySelector(this.imageSelector);
        if (!articleImage) return [];

        let srcset = articleImage.getAttribute("srcset");
        if (!srcset) {
            srcset = articleImage.getAttribute("src");
        }
        return (
            [
                ...new Set(
                    srcset
                        ?.split(", ")
                        .map((url) => normalizeUrl(url))
                        .filter((el): el is string => el !== undefined)
                ),
            ] || []
        );
    }

    scrapeVideos(article: Element) {
        return [];
    }

    scrapeCategory(article: Element) {
        const articleCategory = article.querySelector(this.categorySelector);
        if (!articleCategory) return "";

        return articleCategory.textContent || "";
    }

    scrapeUrls() {
        const links = this.document.querySelectorAll("a");

        const urls = [];
        for (let link of links) {
            let cleanedUrl;
            if (link.href.startsWith("/")) {
                cleanedUrl = normalizeUrl(
                    `${this.publication.baseUrl}${link.href}`
                );
            } else {
                cleanedUrl = normalizeUrl(link.href);
            }

            if (!cleanedUrl) continue;

            const urlObject = new URL(cleanedUrl);
            if (
                urlObject.host === new URL(this.publication.baseUrl).host &&
                !this.publication.excluded.includes(cleanedUrl)
            )
                urls.push(cleanedUrl);
        }

        return urls;
    }

    checkArticleExistence(minDate: string, maxDate: string) {
        const articles = this.document.querySelectorAll(this.articlesSelector);

        if (articles.length == 0) return false;

        for (let i = 0; i < articles.length; i++) {
            let datePublished: Date | string | undefined =
                articles[i].querySelector("time")?.dateTime;

            if (!datePublished) continue;

            try {
                datePublished = new Date(datePublished);
                if (checkPublishedDate(datePublished, minDate, maxDate))
                    return true;
            } catch (error) {
                continue;
            }
        }

        return false;
    }

    scrapeArticles(currentUrl: string) {
        const articles = this.document.querySelectorAll(this.articlesSelector);
        if (!articles || articles.length === 0) return;

        const articleLinks: (ArticleT | ArticleLinkT)[] = [];

        [...articles].forEach((article) => {
            /**
             * only interested on articles that have published date in it
             */
            const datePublished = this.scrapePublishedDate(article);
            if (!datePublished) return;

            try {
                const articleObj = {
                    articleUrl: currentUrl,
                    datePublished,
                };

                const title = this.scrapeTitle(article);
                if (title !== undefined) {
                    articleLinks.push({
                        title: title,
                        content: this.scrapeContent(article),
                        images: this.scrapeImages(article),
                        category: this.scrapeCategory(article),
                        ...articleObj,
                    });
                } else {
                    const articleUrl = article
                        .querySelector("h2, h3, h4, h5, h6")
                        ?.querySelector("a")?.href;

                    if (articleUrl) {
                        articleLinks.push({
                            ...articleObj,
                            articleUrl: normalizeUrl(articleUrl) || "",
                        });
                    }
                }
            } catch (error) {
                console.error(error);
            }
        });

        return articleLinks;
    }
}

export default RapplerScraper;
