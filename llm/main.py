from transformers import pipeline
from fastapi import FastAPI

from schema.summarizer import SummarizeRequest


app = FastAPI()

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

@app.post("/summarize")
def summarize(summarize_request: SummarizeRequest):
    num_words = len(summarize_request.text.split(" "))
    min_length = int(num_words * .25)
    max_length = int(num_words * .65)
    
    summary = summarizer(summarize_request.text, max_length=max_length, min_length=min_length, do_sample=False)
    
    return {
        "success": False,
        "message": "ok",
        "data": summary[0]
    }
