from flask import Flask, request, jsonify, send_from_directory
from langchain_community.llms.ollama import Ollama
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Initialiser le modèle Ollama
MODEL = "llama3.2"
model = Ollama(model=MODEL, temperature=0)

@app.route('/')
def index():
    return send_from_directory(os.getcwd(), 'index.html')  # Serve index.html

@app.route('/chat', methods=['POST'])
def chat():
    # Récupérer le message de l'utilisateur
    data = request.json
    user_input = data.get("message")

    if not user_input:
        return jsonify({"error": "Pas de message reçu"}), 400

    # Utiliser le modèle Ollama pour générer une réponse
    response = model(user_input)
    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(debug=True)
