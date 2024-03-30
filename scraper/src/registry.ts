import Rappler from "./publications/rappler";
import { PublicationI } from "./types";

class Registry {
    private static publications: { [key: string]: new () => PublicationI } = {
        rappler: Rappler,
    };

    static getPublication(publication: string): PublicationI | null {
        const PublicationClass = Registry.publications[publication];
        if (PublicationClass) {
            return new PublicationClass();
        }
        return null;
    }
}

export default Registry;
