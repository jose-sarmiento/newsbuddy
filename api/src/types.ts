export interface NewsT {
    _id?: string;
    id: string;
    title: string;
    content: string;
    images: string[];
    category: string;
    articleUrl: string;
    datePublished: string;
    dateCreated: string;
    summary?: string;
}

export interface NewsDocumentT {
    _index: string;
    _type: string;
    _id: string;
    _score: number;
    _source: NewsT;
}
