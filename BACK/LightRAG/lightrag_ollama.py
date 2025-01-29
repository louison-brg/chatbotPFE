import argparse
import os
import logging
import hashlib
import json
import re
from lightrag import LightRAG, QueryParam
from lightrag.llm import ollama_model_complete, ollama_embedding
from lightrag.utils import EmbeddingFunc

LOG_FILE = os.path.join("./BACK/LightRAG/lightrag.log")

# Configure logging to save logs in the specified directory
logging.basicConfig(
    filename=LOG_FILE,  # Save logs to the specified file
    filemode="a",  # Append mode (use "w" to overwrite on each run)
    format="%(levelname)s:%(message)s",
    level=logging.INFO
)

# Function to compute hash of a file
def compute_file_hash(file_path):
    """Compute the hash of the file to track content changes."""
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()


# Parse arguments
parser = argparse.ArgumentParser(description="Run LightRAG with a specified document.")
parser.add_argument(
    "--path",
    type=str,
    required=True,
    help="Path to the document to be used."
)
args = parser.parse_args()

# Check if the specified file exists
document_path = args.path
if not os.path.exists(document_path):
    raise FileNotFoundError(f"The specified file does not exist: {document_path}")

# Working directory for LightRAG
WORKING_DIR = "./BACK/LightRAG/dickens"
if not os.path.exists(WORKING_DIR):
    os.makedirs(WORKING_DIR)

# Path to store the hash of the last processed document
hash_file_path = os.path.join(WORKING_DIR, "last_document_hash.txt")

# Compute the current hash of the document
current_document_hash = compute_file_hash(document_path)

# Check if the document hash has changed
use_cache = False
if os.path.exists(hash_file_path):
    with open(hash_file_path, "r") as hash_file:
        last_hash = hash_file.read().strip()
        if last_hash == current_document_hash:
            use_cache = True

# Initialize LightRAG with Ollama
rag = LightRAG(
    working_dir=WORKING_DIR,
    llm_model_func=ollama_model_complete,  # Use the Ollama model for text generation
    llm_model_name='qwen2:latest',  # Model name
    embedding_func=EmbeddingFunc(
        embedding_dim=768,
        max_token_size=8192,
        func=lambda texts: ollama_embedding(
            texts,
            embed_model="nomic-embed-text"
        )
    ),
)

# If the document has changed, clear the cache and reinsert the content
if not use_cache:
    # Clear the existing cache
    logging.info("Document has changed, clearing the cache.")
    print("Document has changed, processing the new document...")

    with open(hash_file_path, "w") as hash_file:
        hash_file.write(current_document_hash)

    # Load and insert the specified document
    with open(document_path, "r", encoding="utf-8") as f:
        rag.insert(f.read())
else:
    logging.info("Using cached data for the document.")
    print("Using cached data for the document.")

# Define the query
query = "Identify the main entities, their roles, and the key relationships mentioned in this text. Summarize significant achievements, events, places, and notable connections described, ensuring clarity for structuring a knowledge graph."


# Function to run the query in local mode and display results
def run_local_mode_query(rag, query):
    param = QueryParam(mode="local")
    response = rag.query(query, param=param)
    return response

# Get and display results for local mode
response = run_local_mode_query(rag, query)

print("--- Results for LOCAL Mode ---\n")
print(response)
