from transformers import pipeline
from fastapi import FastAPI, Response, status

from schema.summarizer import SummarizeRequest


app = FastAPI()

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

@app.post("/summarize")
def summarize(summarize_request: SummarizeRequest, response: Response):
    try:
        num_words = len(summarize_request.text.split(" "))
        min_length = int(num_words * .25)
        max_length = int(num_words * .65)
        
        summary = summarizer(summarize_request.text, max_length=max_length, min_length=min_length, do_sample=False)
        
        return {
            "success": True,
            "message": "ok",
            "data": summary[0]
        }
    except BaseException as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {
            "success": False,
            "error": str(e),
            "data": None
        }
