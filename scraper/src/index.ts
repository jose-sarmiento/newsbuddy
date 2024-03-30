import fs from "fs/promises";
import Crawler from "./crawler";
import { utcToZonedTime, format } from "date-fns-tz";
import { Settings } from "./config/settings";
import Registry from "./registry";
import Rappler from "./publications/rappler";

function init() {
    Registry.registerPublication("rappler", Rappler);
}

async function main() {
    if (process.argv.length < 3) {
        console.log("No publication provided");
        process.exit(1);
    }

    if (process.argv.length > 3) {
        console.log("Too many arguments, supported 3");
        process.exit(1);
    }

    init();

    const Publication = Registry.getPublication(process.argv[2].trim());
    if (!Publication) {
        console.log("Publication not supported");
        process.exit(1);
    }

    console.log(`Started crawling ${Publication.name}`);

    const currentDatePH = utcToZonedTime(new Date(), Settings.timezone);
    const startDateISO = format(currentDatePH, "yyyy-MM-dd'T'00:00:00XXX");
    const endDateISO = format(currentDatePH, "yyyy-MM-dd'T'23:59:59XXX");
    const crawlerObj = new Crawler(Publication);
    const pages = crawlerObj.run(startDateISO, endDateISO);

    // await fs.writeFile("./data.json", JSON.stringify(pages, null, 2), "utf-8");
}

main();
// today or past ago
