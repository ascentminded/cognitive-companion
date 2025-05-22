# main.py
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, constr
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import google.generativeai as genai
import logging
import os
import re
from dotenv import load_dotenv

# Load env variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not set")

genai.configure(api_key=GEMINI_API_KEY)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# App & middleware
app = FastAPI()
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

app.add_exception_handler(RateLimitExceeded, lambda request, exc: HTTPException(status_code=429, detail="Too many requests"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://cognition-frontend.onrender.com"],  # Change for prod
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

# Request body model with simple sanitization
class AnalyzeRequest(BaseModel):
    article: constr(min_length=20, max_length=10000)  # Basic length bounds

    def sanitized(self):
        return re.sub(r"[\x00-\x1f\x7f-\x9f]", "", self.article.strip())

@app.post("/analyze")
@limiter.limit("10/minute")
async def analyze_text(request: Request, payload: AnalyzeRequest):
    text = payload.sanitized()
    logger.info("Received input: %s...", text[:100])

    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash-preview-04-17")
        response = model.generate_content(
            f"Summarize the following and provide:\n\n1. A short summary\n2. 3–5 key points\n3. 3 reflection questions\n\nText:\n{text}"
        )

        full = response.text
        logger.info("Gemini response: %s", full[:300])

        # Use basic pattern separation
        summary_match = re.search(r"(?i)summary[:\-\n]?(.*?)(?:\n\n|key points|1\.)", full, re.DOTALL)
        summary = summary_match.group(1).strip() if summary_match else "No summary found."

        key_points = re.findall(r"[-•*]\s+(.*)", full)
        questions = re.findall(r"(?:\d+\.\s*)?(.+\?)", full)

        return {
            "summary": summary,
            "key_points": key_points[:5],
            "reflection_questions": questions[:3],
        }

    except Exception as e:
        logger.exception("Gemini API failed")
        raise HTTPException(status_code=500, detail="Internal Server Error")
