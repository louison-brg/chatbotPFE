import argparse
import os
import logging
import hashlib
from langchain_community.llms.ollama import Ollama
from lightrag import LightRAG, QueryParam
from lightrag.llm import ollama_model_complete, ollama_embedding
from lightrag.utils import EmbeddingFunc

# Get the absolute path of the current script
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Log file path inside BACK/LightRAG
LOG_FILE = os.path.join(BASE_DIR, "lightrag.log")

# Configure logging
logging.basicConfig(
    filename=LOG_FILE,
    filemode="w",  
    format="%(levelname)s: %(message)s",
    level=logging.INFO
)

logging.info("LightRAG script started successfully.")

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
query = "Identify the main entities, their roles, and the key relationships mentioned in this text. Summarize significant achievements, events, places, and notable connections described, ensuring clarity."


# Function to run the query in local mode and display results
def run_local_mode_query(rag, query):
    param = QueryParam(mode="local")
    response = rag.query(query, param=param)
    return response

# Get and display results for local mode
response = run_local_mode_query(rag, query)

#print("--- Results for LOCAL Mode ---\n")
#print(response)

# Initialize the Ollama model
MODEL = "phi3"
model = Ollama(model=MODEL, temperature=0)

phi3_prompt = f"""
Generate a series of concise yet informative question-answer pairs based on the following content:

{response}

- Each question should be short but meaningful.  
- Each answer should be clear, well-explained, and directly informative.  
- Do NOT mention "the text" or refer to the source in any way.  
- Format the response strictly as follows:  
  Q: *question*; A: *answer*  

Example format:  
Q: Who was the main figure?; A: The main figure was [Name], who played a crucial role in [Context].  

Now, generate the questions and answers.
"""

# Query Ollama (Phi-3) model using the initialized instance
phi3_response = model.invoke(phi3_prompt)

# Display the generated questions and answers
#print("\n--- Questions & Answers Generated by Phi-3 ---\n")
#print(phi3_response)

import json
import os

# Récupérer le nom du document depuis le chemin
document_name = os.path.basename(document_path).split('.')[0]  # Supprime l'extension du fichier

# Définir le chemin du fichier de sortie
qa_dir = os.path.join(os.path.dirname(document_path), "qa")
os.makedirs(qa_dir, exist_ok=True)  # Crée le dossier si inexistant

qa_file_path = os.path.join(qa_dir, f"qa_{document_name}.json")

# Transformer la réponse du chatbot en format JSON
qa_pairs = []
for line in phi3_response.strip().split("\n"):
    if line.startswith("Q:") or line.startswith("A:"):
        qa_pairs.append(line.strip())

# Regrouper en objets JSON
qa_data = []
for i in range(0, len(qa_pairs), 2):  # Parcourt les paires (Q, A)
    if i + 1 < len(qa_pairs):
        qa_data.append({"prompt": f"{qa_pairs[i]}\n{qa_pairs[i+1]}"})

# Sauvegarder en fichier JSON
with open(qa_file_path, "w", encoding="utf-8") as f:
    for entry in qa_data:
        json.dump(entry, f, ensure_ascii=False)
        f.write("\n")  # Ajoute une nouvelle ligne entre les objets JSON

print(f"Q&A saved to: {qa_file_path}")
