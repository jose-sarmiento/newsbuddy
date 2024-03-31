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

export function isWithinElapsed(dateStringIso: string, elapsedSeconds: number) {
    try {
        const inputDate = new Date(dateStringIso);
        const inputDateUTC = inputDate.getTime();
        const nowUTC = Date.now();

        const diffSeconds = Math.abs(nowUTC - inputDateUTC) / 1000;

        return diffSeconds <= elapsedSeconds;
    } catch (error) {
        console.error(`Invalid date string provided: ${dateStringIso}`);
        return false;
    }
}

export function isWithinRange(
    datetimeIso: string,
    startDatetimeIso: string,
    endDatetimeIso: string
) {
    try {
        const datetime = new Date(datetimeIso);
        const startDatetime = new Date(startDatetimeIso);
        const endDatetime = new Date(endDatetimeIso);

        const datetimeUTC = datetime.getTime();
        const startDatetimeUTC = startDatetime.getTime();
        const endDatetimeUTC = endDatetime.getTime();

        return datetimeUTC >= startDatetimeUTC && datetimeUTC <= endDatetimeUTC;
    } catch (error: any) {
        console.error(`Error occurred: ${error}`);
        return false;
    }
}
