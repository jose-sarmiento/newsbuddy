import { Router } from "express";
import newsHandler from "../controllers/news";

const route = Router();

route.get("/", newsHandler.getAllNews);

export default route;
