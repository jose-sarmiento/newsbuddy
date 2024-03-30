export const normalizeUrl = (url: string): string | undefined => {
    try {
        if (!url) return;
        const urlObj = new URL(url);
        let cleanedUrl = `${urlObj.host}${urlObj.pathname}`;
        if (cleanedUrl.length > 0 && cleanedUrl.slice(-1) === "/") {
            cleanedUrl = cleanedUrl.slice(0, -1);
        }

        if (cleanedUrl === "blank") return;

        return "http://" + cleanedUrl;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Invalid URL: ${url}`);
        } else {
            console.error(`Invalid URL: ${url}`);
        }
    }
};
