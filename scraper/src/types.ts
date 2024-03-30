export type ScrapeUrls = { [key: string]: number };

export interface PublicationI {
    name: string;
    displayName: string;
    baseUrl: string;

    saveArticle: (article: ArticleT) => void;

    getScraper: (html: string, publication: PublicationI) => ScraperI;

    getExistingUrls: () => ScrapeUrls;
}

export interface ScraperI {
    checkArticleExistence: (minDate: string, maxDate: string) => boolean;

    scrapeArticles: (
        currentUrl: string
    ) => (ArticleT | ArticleLinkT)[] | undefined;

    scrapeTitle: (article: Element) => string | undefined;
    scrapeContent: (article: Element) => string | undefined;
    scrapePublishedDate: (article: Element) => Date | undefined;
    scrapeImages: (article: Element) => string[];
    scrapeVideos: (article: Element) => string[];
    scrapeUrls: () => string[];
    scrapeCategory: (article: Element) => string | undefined;
}

export type ArticleT = {
    title: string;
    content: string;
    category: string;
    datePublished: Date;
    articleUrl: string;
    images?: string[];
    videos?: string[];
};

export type ArticleLinkT = {
    datePublished: Date;
    articleUrl: string;
};
