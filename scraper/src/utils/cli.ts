import logger from "../config/logger";
import { CommandLineArgsT } from "../types";

export function extractCommandLineArgs(
    argvs: string[]
): CommandLineArgsT | undefined {
    const args = argvs.slice(2);

    if (args.length < 2) {
        logger.error(
            "Usage: npm run dev <publication> (--elapse=<minutes> | --start=<datetimeUTC> --end=<datetimeUTC>)"
        );
        return;
    }

    const publication = args[0];
    const option = args[1];

    if (option.startsWith("--elapse=")) {
        const elapsedMinutes = parseInt(option.substring(9));
        if (isNaN(elapsedMinutes)) {
            logger.error("Invalid elapsed time value.");
            return;
        }

        return {
            publication,
            dateInput: {
                type: "elapsed",
                elapsedInMinutes: elapsedMinutes,
            },
        };
    } else if (option.startsWith("--start=")) {
        const startDateString = option.substring(8);
        const endDateOption = args[2];

        if (!endDateOption || !endDateOption.startsWith("--end=")) {
            logger.error("Invalid option. Expected --end=<datetimeUTC>.");
            return;
        }

        const endDateString = endDateOption.substring(6);

        return {
            publication,
            dateInput: {
                type: "range",
                startDate: startDateString,
                endDate: endDateString,
            },
        };
    } else {
        logger.error(
            "Invalid option. Supported options are --elapse=<minutes> or --start=<datetimeUTC> --end=<datetimeUTC>."
        );
        return;
    }
}
