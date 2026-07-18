from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.model import SentimentModel

app = FastAPI(title="Sentiment Analysis API", version="1.0.0")

# Allow the frontend (served from a different origin/port) to call this API.
# Lock this down to your real frontend origin(s) before deploying.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model + vectorizer + stopwords once at startup, reuse for every request.
sentiment_model = SentimentModel()


class PredictRequest(BaseModel):
    text: str


class PredictResponse(BaseModel):
    label: str
    confidence: float
    probabilities: dict


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="`text` must not be empty")

    label, confidence, probs = sentiment_model.predict(text)
    return PredictResponse(label=label, confidence=confidence, probabilities=probs)
