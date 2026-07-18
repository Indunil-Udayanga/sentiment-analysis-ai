import json
import re
import string
from pathlib import Path

import joblib
import torch
import torch.nn as nn

ARTIFACTS_DIR = Path(__file__).parent / "artifacts"


class SentimentANN(nn.Module):
    """Must match the architecture used during training exactly,
    or the saved state_dict will fail to load."""

    def __init__(self, input_size, num_classes=3):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_size, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.6),

            nn.Linear(64, 32),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.Dropout(0.5),

            nn.Linear(32, num_classes),
        )

    def forward(self, x):
        return self.network(x)


class SentimentModel:
    def __init__(self):
        config_path = ARTIFACTS_DIR / "model_config.json"
        weights_path = ARTIFACTS_DIR / "best_model.pth"
        tfidf_path = ARTIFACTS_DIR / "tfidf_vectorizer.joblib"
        stopwords_path = ARTIFACTS_DIR / "stop_words.joblib"

        for p in (config_path, weights_path, tfidf_path, stopwords_path):
            if not p.exists():
                raise FileNotFoundError(
                    f"Missing model artifact: {p}. "
                    "Copy the files produced by the training notebook "
                    "(best_model.pth, tfidf_vectorizer.joblib, stop_words.joblib, "
                    "model_config.json) into backend/app/artifacts/."
                )

        with open(config_path) as f:
            self.config = json.load(f)

        self.label_map = {int(k): v for k, v in self.config["label_map"].items()}

        self.tfidf = joblib.load(tfidf_path)
        self.stop_words = joblib.load(stopwords_path)

        self.model = SentimentANN(self.config["input_size"], self.config["num_classes"])
        self.model.load_state_dict(torch.load(weights_path, map_location="cpu"))
        self.model.eval()

    def preprocess(self, text: str) -> str:
        """Mirrors the cleaning pipeline used in the training notebook:
        lowercase -> strip punctuation -> strip digits -> collapse whitespace -> drop stopwords."""
        text = text.lower()
        text = text.translate(str.maketrans("", "", string.punctuation))
        text = re.sub(r"\d+", "", text)
        text = re.sub(r"\s+", " ", text).strip()
        text = " ".join(word for word in text.split() if word not in self.stop_words)
        return text

    def predict(self, text: str):
        cleaned = self.preprocess(text)
        vec = self.tfidf.transform([cleaned]).toarray()
        vec_t = torch.from_numpy(vec).float()

        with torch.no_grad():
            output = self.model(vec_t)
            probs = torch.softmax(output, dim=1).numpy()[0]
            predicted_idx = int(probs.argmax())

        label = self.label_map[predicted_idx]
        confidence = float(probs[predicted_idx])
        probabilities = {self.label_map[i]: float(p) for i, p in enumerate(probs)}

        return label, confidence, probabilities
