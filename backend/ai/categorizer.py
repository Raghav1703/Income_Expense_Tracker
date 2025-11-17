import os
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

MODEL_PATH = os.path.join("ai", "category_model.pkl")
VEC_PATH = os.path.join("ai", "vectorizer.pkl")


def train_category_model():
    data = pd.DataFrame({
        "text": [
            "pizza", "burger", "milk", "vegetables", "grocery",
            "uber", "ola", "petrol", "bus", "train ticket",
            "movie", "netflix", "concert", "games",
            "electricity bill", "water bill", "mobile recharge",
            "t-shirt", "shoes", "shopping mall"
        ],
        "category": [
            "Food", "Food", "Food", "Food", "Food",
            "Travel", "Travel", "Travel", "Travel", "Travel",
            "Entertainment", "Entertainment", "Entertainment", "Entertainment",
            "Bills", "Bills", "Bills",
            "Shopping", "Shopping", "Shopping"
        ]
    })

    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(data["text"])
    y = data["category"]

    model = LogisticRegression()
    model.fit(X, y)

    joblib.dump(model, MODEL_PATH)
    joblib.dump(vectorizer, VEC_PATH)


def predict_category(text):
    if not os.path.exists(MODEL_PATH):
        train_category_model()

    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VEC_PATH)

    X = vectorizer.transform([text])
    return model.predict(X)[0]
