import "fs"
import { ScrapeData } from "../types/crawlerTypes";

class BaseCrawler {
    save(data: ScrapeData) {
        const fs = require("fs");

        const filePath = "output.jsonl";
        const stream = fs.createWriteStream(filePath, { flags: 'a' });
        stream.write(JSON.stringify(data) + '\n');
        stream.end();
    }
}

export { BaseCrawler };
