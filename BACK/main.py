from fastapi import FastAPI, HTTPException
from langchain_community.llms.ollama import Ollama
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Initialize the Ollama model
MODEL = "phi3"
model = Ollama(model=MODEL, temperature=0)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the request model
class ChatRequest(BaseModel):
    message: str


@app.get("/")
async def root():
    return {"message": "Hello World"}


# Define the chat endpoint
@app.post("/chat")
async def chat(request: ChatRequest):
    user_input = request.message

    if not user_input:
        raise HTTPException(status_code=400, detail="Pas de message reçu")

    try:
        # Generate a response using the Ollama model
        response = model.invoke(user_input)
        return {"response": response}
    except Exception as e:
        # Log the error and return a server error response
        raise HTTPException(status_code=500, detail=str(e))