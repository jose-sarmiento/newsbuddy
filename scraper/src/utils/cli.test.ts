import { describe, expect, test } from "@jest/globals";
import { extractCommandLineArgs } from "./cli";

describe("Function: extractCommandLineArgs", () => {
    test("it should return undefined if number of arguments is less than required", () => {
        const input = ["", "", "rappler"];
        const actual = extractCommandLineArgs(input);
        const expected = undefined;

        expect(actual).toBe(expected);
    });

    test("it should return undefined if elapsed value is not valid", () => {
        const input = ["", "", "rappler", "--elapse=f2"];
        const actual = extractCommandLineArgs(input);
        const expected = undefined;

        expect(actual).toBe(expected);
    });

    test("it should return success data if publication and correct elapse is provided", () => {
        const input = ["", "", "rappler", "--elapse=2"];
        const actual = extractCommandLineArgs(input);
        const expected = {
            publication: "rappler",
            dateInput: {
                type: "elapsed",
                elapsedInMinutes: 2,
            },
        };

        expect(actual).toEqual(expected);
    });

    test("it should return undefined if date start and end args is not valid", () => {
        const input = ["", "", "rappler", "--startt=fr", "--endd=fr"];
        const actual = extractCommandLineArgs(input);
        const expected = undefined;

        expect(actual).toBe(expected);
    });

    test("it should return success data if publication and correct date range is provided", () => {
        const startDate = "2024-03-30T00:00:00.000Z";
        const endDate = "2024-03-30T11:28:08.438Z";
        const input = [
            "",
            "",
            "rappler",
            `--start=${startDate}`,
            `--end=${endDate}`,
        ];
        const actual = extractCommandLineArgs(input);
        const expected = {
            publication: "rappler",
            dateInput: {
                type: "range",
                startDate: startDate,
                endDate: endDate,
            },
        };

        expect(actual).toEqual(expected);
    });
});
