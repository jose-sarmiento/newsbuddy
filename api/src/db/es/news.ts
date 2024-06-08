import config from "../../config";
import { client } from "../../loaders/elasticsearch";
import { NewsDocumentT, NewsT } from "../../types";

function parseESResponse(news: any): NewsT {
    return {
        _id: news._id,
        id: news._source.id,
        title: news._source.title,
        content: news._source.content,
        images: news._source.images,
        category: news._source.category,
        articleUrl: news._source.articleUrl,
        datePublished: news._source.datePublished,
        dateCreated: news._source.dateCreated,
        summary: news._source.summary,
    };
}

export async function getLatestNews(): Promise<NewsT[]> {
    const results = await client().search({
        index: config.elasticsearch.articles_index,
    });

    return results.hits.hits.map((news) => parseESResponse(news));
}
