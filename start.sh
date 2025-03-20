#!/bin/bash
set -e

# Ensure Ollama binds to 0.0.0.0
export OLLAMA_HOST=0.0.0.0

echo "Starting Ollama server on port 11434..."

ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to initialize
sleep 5

echo "Pulling Ollama models..."
ollama pull phi3
ollama pull qwen2
ollama pull nomic-embed-text

echo "Starting main FastAPI server (which also starts the upload server)..."
python ./BACK/main.py

# Keep the script running
wait
