import { PublicationI } from "./types";

type PublicationClass = new () => PublicationI;

class Registry {
    private static publications: Map<string, PublicationClass> = new Map();

    static registerPublication(
        name: string,
        PublicationClass: PublicationClass
    ): void {
        Registry.publications.set(name, PublicationClass);
    }

    static getPublication(name: string): PublicationI | undefined {
        const PublicationClass = Registry.publications.get(name.toLowerCase());
        if (!PublicationClass) return;

        return new PublicationClass();
    }
}

export default Registry;
