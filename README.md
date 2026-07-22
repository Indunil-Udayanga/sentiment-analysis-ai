# Sentiment Analysis Web Application

A full-stack AI-powered Sentiment Analysis web application that classifies user comments into **Positive**, **Neutral**, and **Negative** sentiments using a Deep Learning model built with **PyTorch**.

##  Features

- Real-time sentiment prediction
- Three-class classification (Positive, Neutral, Negative)
- FastAPI REST API
- Responsive React frontend *(AI-generated)*
- Fast and accurate inference

---

## Tech Stack

### AI / Machine Learning
- Python
- PyTorch
- Scikit-learn
- Pandas
- NumPy
- NLTK
- TF-IDF Vectorizer

### Backend
- FastAPI
- Uvicorn

### Frontend
- React.js *(AI-generated UI)*
- HTML
- CSS
- JavaScript

---

##  Model Pipeline

### Data Preprocessing
- Remove null values & duplicates
- Convert text to lowercase
- Remove punctuation & numbers
- Remove stopwords
- Clean whitespace

### Feature Extraction
- TF-IDF Vectorizer (`max_features=5000`)

### Model Architecture

```text
Input Text
     │
     ▼
Text Preprocessing
     │
     ▼
TF-IDF Vectorizer (5000 Features)
     │
     ▼
Linear (5000 → 256)
     │
    ReLU
     │
 Dropout (0.3)
     │
     ▼
Linear (256 → 128)
     │
    ReLU
     │
 Dropout (0.3)
     │
     ▼
Linear (128 → 64)
     │
    ReLU
     │
     ▼
Linear (64 → 3)
     │
     ▼
Softmax
     │
     ▼
Positive | Neutral | Negative
```

### Training
- Loss Function: CrossEntropyLoss
- Optimizer: Adam
- Framework: PyTorch

---

## Working Flow

```text
User Input
     │
     ▼
Text Preprocessing
     │
     ▼
TF-IDF Feature Extraction
     │
     ▼
PyTorch ANN Model
     │
     ▼
FastAPI Backend
     │
     ▼
React Frontend
     │
     ▼
Sentiment Prediction
```

---

##  Project Demo

🔗 **LinkedIn Demo**

https://www.linkedin.com/feed/update/urn:li:activity:7484301757800402945/

---

## Author

**Indunil Udayanga**

Computer Science Undergraduate | AI & Machine Learning Enthusiast

- GitHub: https://github.com/Indunil-Udayanga
- LinkedIn: https://www.linkedin.com/in/indunil-udayanga-8a908b38a/

## 📄 License

This project is licensed under the MIT License.
