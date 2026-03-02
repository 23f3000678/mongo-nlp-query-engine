import spacy
from fastapi import FastAPI

app = FastAPI()
nlp = spacy.load("en_core_web_sm")

@app.post("/analyze")
async def analyze(data: dict):
    text = data["query"]
    doc = nlp(text)

    entities = []
    for ent in doc.ents:
        entities.append({
            "text": ent.text,
            "label": ent.label_
        })

    numbers = []
    for token in doc:
        if token.like_num:
            numbers.append(token.text)

    return {
        "entities": entities,
        "numbers": numbers
    }