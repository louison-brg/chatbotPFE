import os
import argparse
import json
from langchain_community.llms.ollama import Ollama
from upload2 import QA_FOLDER

# Initialize the Ollama model
MODEL = "phi3"
model = Ollama(model=MODEL, temperature=0)

def summarize_text(text):
    """Génère un résumé du texte donné sans ajouter d'informations supplémentaires."""
    print("[LOG] Envoi du texte à Ollama pour résumé...")
    summary_prompt = f"Summarize the following text concisely without adding any information:\n\n{text}"
    summary_response = model.invoke(summary_prompt)
    print(f"[LOG] Réponse d'Ollama : {summary_response}")
    return summary_response.strip()

def generate_qa(summary):
    """Génère des questions-réponses à partir du résumé en utilisant Ollama."""
    print("[LOG] Envoi du résumé à Ollama pour génération de Q&A...")
    phi3_prompt = f"""
    Generate a series of concise yet informative question-answer pairs based on the following content:
    
    {summary}
    
    - Each question should be short but meaningful.
    - Each answer should be clear, well-explained, and directly informative.
    - Do NOT mention "the text" or refer to the source in any way.
    - Format the response strictly as follows:
      Q: *question*; A: *answer*
    
    Example format:
    Q: Who was the main figure?; A: The main figure was [Name], who played a crucial role in [Context].
    
    Now, generate the questions and answers.
    """
    qa_response = model.invoke(phi3_prompt)
    print(f"[LOG] Réponse d'Ollama : {qa_response}")  # Ajout du log pour voir la réponse brute
    return qa_response.strip()

def process_file(file_path):
    """Traite un fichier texte pour générer un fichier JSON de questions-réponses dans un format spécifique."""    
    with open(file_path, "r", encoding="utf-8") as file:
        text = file.read()
    
    summary = summarize_text(text)
    qa_text = generate_qa(summary)

    # Vérifier si qa_text est vide et gérer l'erreur
    if not qa_text:
        print("[ERROR] Aucune réponse générée pour le Q&A.")
        return None  # Retourner None si aucune réponse n'a été générée
    
    # Conversion du texte QA en JSON avec format spécifique
    qa_pairs = []
    for line in qa_text.split("\n"):
        if line.startswith("Q:") and "; A:" in line:
            try:
                question, answer = line.split("; A:")
                # Formattage de la réponse pour correspondre au format demandé
                prompt = f"Q: {question.strip('Q: ').strip()}\nA: {answer.strip()}"
                qa_pairs.append({"prompt": prompt})
            except ValueError:
                print(f"[LOG] Erreur lors du traitement de la ligne : {line}")  # Handle errors if line doesn't split properly
        else:
            print(f"[LOG] Ligne ignorée : {line}")  # Skip lines that don't match expected Q&A format
    
    # Sauvegarde du résultat dans un fichier JSON ligne par ligne dans QA_FOLDER
    json_filename = "qa_" + os.path.basename(file_path).replace(".txt", ".json")
    json_path = os.path.join(QA_FOLDER, json_filename)
    
    with open(json_path, "w", encoding="utf-8") as json_file:
        for pair in qa_pairs:
            json.dump(pair, json_file, indent=None, ensure_ascii=False)
            json_file.write("\n")  # Write each prompt on a new line
    
    print(f"Fichier Q&A généré: {json_path}")
    
    # Suppression du fichier .txt après traitement
    os.remove(file_path)
    print(f"Fichier texte {file_path} supprimé.")
    
    return json_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--path", type=str, required=True, help="Chemin du fichier texte à traiter")
    args = parser.parse_args()
    
    if not os.path.exists(args.path):
        print("Erreur : Le fichier spécifié n'existe pas.")
    else:
        process_file(args.path)
