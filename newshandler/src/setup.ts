import axios from "axios";
import { connectElasticsearch } from "./db/es";
import { AxiosError } from "axios";


function createArticleIndex() {
    const esClient = connectElasticsearch()
    esClient.indices.create({
        index: 'articles',
        body: {
            mappings: {
                properties: {
                    id: { "type": "keyword"  },
                    title: { "type": "text"  },
                    content: { "type": "text"  },
                    images: { "type": "keyword"  },
                    category: { "type": "keyword"  },
                    articleUrl: { "type": "keyword" },
                    datePublished: { "type": "date"  },
                    dateCreated: { "type": "date"  },
                    dateUpdated: { "type": "date"  },
                    summary: { "type": "text"  },
                }
            }
        }
    })
}

(async () => {
    try {      
        await axios.get(`${process.env.ES_URI}/articles`)
    } catch (error) {
        if (error instanceof AxiosError) {
            if (error?.response?.status === 404) {
                console.log("Creating articles index")
                createArticleIndex()
            }
        }
    }
})()