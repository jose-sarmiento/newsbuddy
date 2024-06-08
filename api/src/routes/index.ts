import { Router } from "express";

import newsRouter from "./news";

export default function () {
    const app = Router();

    app.use("/news", newsRouter);

    return app;
}
