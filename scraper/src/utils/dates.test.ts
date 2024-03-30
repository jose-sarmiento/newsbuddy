import { describe, expect, test } from "@jest/globals";

import { isWithinElapsed } from "./dates";

describe("Function: isWithinElapsed", () => {
    test("It should return false if given date is past given elapsed", () => {
        const input = "2024-03-29T01:03:48.000Z";
        const actual = isWithinElapsed(input, 60 * 60);
        const expected = false;

        expect(actual).toBe(expected);
    });

    test("It should return true if given date is within elapsed", () => {
        const input = new Date().toUTCString();
        const actual = isWithinElapsed(input, 60 * 60);
        const expected = true;

        expect(actual).toBe(expected);
    });
});
