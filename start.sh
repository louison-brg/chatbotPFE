#!/bin/bash
set -e

echo "Starting Ollama server on port 11434..."
# Start Ollama server with external binding
ollama serve --host 0.0.0.0 &
OLLAMA_PID=$!

# Wait for Ollama to initialize
sleep 5

echo "Pulling Ollama models..."
ollama pull phi3
ollama pull qwen2
ollama pull nomic-embed-text

echo "Starting main FastAPI server (which also starts the upload server)..."
python ./BACK/main.py

# Keep the script running (optional)
wait
