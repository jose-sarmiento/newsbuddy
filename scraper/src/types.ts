export type SettingsT = {
    timezone: string;
    redis_host: string;
    redis_port: number;
    redis_database: number;
};

export type ScrapeUrls = { [key: string]: number };

export interface PublicationI {
    name: string;
    displayName: string;
    baseUrl: string;
    excluded: string[];
    articlesQueue: string;
    scrapedUrlsKey: string;

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

export type DateRange = {
    startDate: string;
    endDate: string;
    type: "range";
};

export type ElapsedTime = {
    elapsedInMinutes: number;
    type: "elapsed";
};

export type DateInput = DateRange | ElapsedTime;

export type CommandLineArgsT = {
    publication: string;
    dateInput: DateRange | ElapsedTime;
};
