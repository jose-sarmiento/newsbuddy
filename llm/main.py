from transformers import pipeline
from fastapi import FastAPI, Response, status

from schema.summarizer import SummarizeRequest
from load_model import summarizer, tokenizer, split_text_into_chunks


app = FastAPI()


def summarize_chunks(text):
    input_ids = tokenizer(text, return_tensors="pt").input_ids

    token_count = input_ids.shape[-1]
    max_length = 250
    min_length = 100
    
    if token_count <= 1024:
        if token_count <= 50:
            min_length = token_count
        result = summarizer(text, max_length=max_length, min_length=min_length, do_sample=False)
    else:
        result = summarizer(text, max_length=max_length, min_length=min_length, do_sample=False)
        
    return result[0]["summary_text"]


@app.post("/summarize")
def summarize(summarize_request: SummarizeRequest, response: Response):
    try:
        chunks = split_text_into_chunks(summarize_request.text)
        summaries = []
        
        for chunk in chunks:
            summaries.append(summarize_chunks(chunk))
        
        return {
            "success": True,
            "message": "ok",
            "data": {
                "summary_text": "\n\n".join(summaries)
            }
        }
    except BaseException as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {
            "success": False,
            "error": str(e),
            "data": None
        }
