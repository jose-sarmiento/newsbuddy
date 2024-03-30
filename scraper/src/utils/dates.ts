import { zonedTimeToUtc } from "date-fns-tz";
import { parseISO, isWithinInterval } from "date-fns";
import { Settings } from "../config/settings";

export function checkPublishedDate(
    datePublished: Date,
    startDate: string,
    endDate: string
) {
    const dateStartUTC = zonedTimeToUtc(parseISO(startDate), Settings.timezone);
    const dateEndUTC = zonedTimeToUtc(parseISO(endDate), Settings.timezone);

    return isWithinInterval(datePublished, {
        start: dateStartUTC,
        end: dateEndUTC,
    });
}
