import asyncio
import os
import inspect
import logging
from lightrag import LightRAG, QueryParam
from lightrag.llm import ollama_model_complete, ollama_embedding
from lightrag.utils import EmbeddingFunc

WORKING_DIR = "./dickens"

logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.INFO)

if not os.path.exists(WORKING_DIR):
    os.mkdir(WORKING_DIR)

# Initialize LightRAG with Ollama model
rag = LightRAG(
    working_dir=WORKING_DIR,
    llm_model_func=ollama_model_complete,  # Use Ollama model for text generation
    llm_model_name='qwen2:latest', # Your model name
    embedding_func=EmbeddingFunc(
        embedding_dim=768,
        max_token_size=8192,
        func=lambda texts: ollama_embedding(
            texts,
            embed_model="nomic-embed-text"
        )
    ),
)

with open("./book.txt", "r", encoding="utf-8") as f:
    rag.insert(f.read())

query = "Identify the main entities, their roles, and the key relationships mentioned in this text. Summarize significant achievements, events, places, and notable connections described, ensuring clarity for structuring a knowledge graph."

# Fonction pour exécuter uniquement le mode local et afficher les résultats
def run_local_mode_query(rag, query):
    param = QueryParam(mode="local")
    response = rag.query(query, param=param)
    return response

# Obtenir et afficher les résultats pour le mode local
response = run_local_mode_query(rag, query)

print("--- Résultats pour le mode LOCAL ---\n")
print(response)