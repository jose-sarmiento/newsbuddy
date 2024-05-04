import { ObjectId } from "mongodb";

export type SettingsT = {
    timezone: string;
    articleQueueKey: string;
    mongo_uri: string;
    redis_host: string;
    redis_port: number;
    redis_database: number;
};

export type ArticleT = {
    title: string;
    content: string;
    category: string;
    datePublished: Date;
    dateCreated: Date;
    articleUrl: string;
    images?: string[];
    videos?: string[];
};

export type AricleWIthId = ArticleT & {
    _id: ObjectId;
};

export class DBArticle {
    constructor(
        public _id: ObjectId,
        public title: string,
        public content: string,
        public category: string,
        public datePublished: Date,
        public dateCreated: Date,
        public articleUrl: string,
        public images?: string[]
    ) {}
}
