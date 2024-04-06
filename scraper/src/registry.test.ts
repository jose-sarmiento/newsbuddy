import { describe, expect, test } from "@jest/globals";
import Registry from "./registry";
import Rappler from "./publications/rappler";

describe("Class: Registry", () =>  {

    test("It should successfully register new publication", () => {
        const pubname = "rappler"
        const pubClass = Rappler
        Registry.registerPublication(pubname, pubClass)
        expect(Registry.getPublication(pubname)).toBeInstanceOf(pubClass)
    })

    test("It should retrun undefined if publications doesnt exist", () => {
        expect(Registry.getPublication("")).toBeUndefined()
    })
})