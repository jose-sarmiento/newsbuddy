import elasticsearch from "@elastic/elasticsearch";
import config from "../config";

const state: { client: elasticsearch.Client } = {
    client: null,
};

export function client() {
    return state.client;
}

export default async function () {
    try {
        state.client = new elasticsearch.Client({
            node: config.elasticsearch.uri,
            maxRetries: 5,
            requestTimeout: 60000,
            sniffOnStart: true,
        });
    } catch (error) {
        throw error;
    }
}
