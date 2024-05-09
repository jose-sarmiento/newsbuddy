import axios from "axios";
import { ISummaryResponse } from "../types";


export const generateSummary = async (text: string) => {
    const response = await axios.post(`${process.env.LLM_API}/summarize`, {
        "text": text
    });
    const data: ISummaryResponse = response.data;
    return data.data.summary_text
}