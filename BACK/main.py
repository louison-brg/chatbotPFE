import argparse
import uvicorn
from fastapi import FastAPI, HTTPException
from langchain_community.llms.ollama import Ollama
from pydantic import BaseModel
from typing import List, Dict
from fastapi.middleware.cors import CORSMiddleware
from rag import initialize_rag_pipeline, retrieve_relevant_document

# Parse command-line arguments for custom options
parser = argparse.ArgumentParser(description="FastAPI Chatbot with RAG system")
parser.add_argument(
    "--qa",
    type=str,
    required=True,  # Make it required
    help="Path to the qa to be used."
)
args = parser.parse_args()

# Initialize the application
app = FastAPI()

# Use the --qa argument value for the JSON file path
JSON_FILE_PATH = args.qa

# Initialize the Ollama model
MODEL = "phi3"
model = Ollama(model=MODEL, temperature=0)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the RAG system
vector_store = initialize_rag_pipeline(JSON_FILE_PATH)

# Store conversation history in memory for the current session
conversation_history: List[Dict[str, str]] = []

# Define the request model
class ChatRequest(BaseModel):
    message: str

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/chat")
async def chat(request: ChatRequest):
    global conversation_history  # Use a global variable for the session's conversation history

    user_input = request.message.strip()  # Ensure no leading/trailing spaces

    if not user_input:
        raise HTTPException(status_code=400, detail="No message received")

    try:
        # Retrieve relevant FAQ entry using RAG
        faq_response = retrieve_relevant_document(user_input, vector_store)

        # Combine FAQ response with user input
        prompt_with_context = f"Context from FAQ:\n{faq_response}\n\nUser: {user_input}\nAssistant: Please answer concisely and go straight to the main point."

        # Generate a response using the Ollama model
        response = model.invoke(prompt_with_context)

        # Append the user's message and the assistant's response to the conversation history
        conversation_history.append({"role": "user", "content": user_input})
        conversation_history.append({"role": "assistant", "content": response})

        return {"response": response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# Start the app with uvicorn
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
