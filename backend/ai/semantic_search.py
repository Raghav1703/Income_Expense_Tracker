from sentence_transformers import SentenceTransformer, util

model = None  # lazy loading

def load_model():
    global model
    if model is None:
        model = SentenceTransformer("all-MiniLM-L6-v2")
    return model

def semantic_search(query, transactions):
    model = load_model()  # load only when needed
    corpus = [f"{t.description} {t.category} {t.date}" for t in transactions]
    
    query_emb = model.encode(query)
    corpus_emb = model.encode(corpus)

    scores = util.cos_sim(query_emb, corpus_emb)[0]
    top_indices = scores.topk(5).indices.tolist()

    return [transactions[i] for i in top_indices]
