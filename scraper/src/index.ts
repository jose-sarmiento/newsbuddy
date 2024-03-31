import fs from "fs";
import Registry from "./registry";
import Rappler from "./publications/rappler";
import { extractCommandLineArgs } from "./utils/cli";
import Crawler from "./crawler";

function registerPublications() {
    Registry.registerPublication("rappler", Rappler);
}

async function main() {
    const inputData = extractCommandLineArgs(process.argv);
    if (!inputData) process.exit(1);

    registerPublications();

    const Publication = Registry.getPublication(process.argv[2].trim());
    if (!Publication) {
        console.log("Publication not supported");
        process.exit(1);
    }

    console.log(`Started crawling ${Publication.name}`);

    const crawlerObj = new Crawler(Publication);
    const pages = crawlerObj.run(inputData.dateInput);

    await fs.writeFile("./data.json", JSON.stringify(pages, null, 2), () => {});
}

main();
