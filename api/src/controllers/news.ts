import { Request, Response, NextFunction } from "express";
import { getLatestNews } from "../db/es/news";

const getAllNews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const results = await getLatestNews();
        res.json({
            links: {},
            data: results,
        });
    } catch (error) {
        next(error);
    }
};

export default { getAllNews };
