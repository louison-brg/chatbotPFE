import json
from langchain.schema import Document
from langchain_ollama import OllamaEmbeddings
from langchain.vectorstores import Chroma

# Load the JSON dataset (JSONL format)
def load_json_dataset(file_path: str):
    """Load a JSON Lines dataset and return documents as LangChain Document objects."""
    documents = []
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            try:
                # Parse each line as a JSON object
                record = json.loads(line.strip())
                # Create a Document object
                documents.append(Document(page_content=record["prompt"], metadata={}))
            except json.JSONDecodeError as e:
                print(f"Error decoding JSON line: {line.strip()} - {e}")
    return documents

# Initialize RAG pipeline
def initialize_rag_pipeline(json_file_path: str, embedding_model: str = "phi3"):
    """Set up the RAG system using Ollama embeddings and Chroma."""
    # Load the dataset
    documents = load_json_dataset(json_file_path)

    # Initialize embeddings
    embeddings = OllamaEmbeddings(model=embedding_model)

    # Create a Chroma vector store
    vector_store = Chroma.from_documents(documents, embeddings)

    return vector_store

# Perform similarity search
def retrieve_relevant_document(query: str, vector_store):
    """Retrieve the most similar document based on a user query."""
    results = vector_store.similarity_search(query)
    if results:
        print("Q&A used : ",results[0].page_content)
        return results[0].page_content  # Return the most relevant document's content
    return "No relevant documents found."
