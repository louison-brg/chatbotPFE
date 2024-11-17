from fastapi import FastAPI, HTTPException
from langchain_community.llms.ollama import Ollama
from pydantic import BaseModel
from typing import List, Dict
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

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
        # Append the user's message to the conversation history
        conversation_history.append({"role": "user", "content": user_input})

        # Format the conversation history for the Ollama model
        prompt = "\n".join(
            [f"{entry['role']}: {entry['content']}" for entry in conversation_history]
        ) + "\nassistant:"  # Add the assistant's turn

        # Generate a response using the Ollama model
        response = model.invoke(prompt)

        # Append the assistant's response to the conversation history
        conversation_history.append({"role": "assistant", "content": response})

        return {"response": response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
