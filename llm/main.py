from transformers import pipeline
from fastapi import FastAPI, Response, status

from schema.summarizer import SummarizeRequest
from load_model import safe_summarize


app = FastAPI()

@app.post("/summarize")
def summarize(summarize_request: SummarizeRequest, response: Response):
    try:
        result = safe_summarize([summarize_request.text])
        if len(result) == 0:
            response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            return {
                "success": False,
                "error": "Failed to generate summary",
                "data": None
            }
            
        return {
            "success": True,
            "message": "ok",
            "data": {
                "summary_text": " ".join(result)
            }
        }
    except BaseException as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {
            "success": False,
            "error": str(e),
            "data": None
        }
