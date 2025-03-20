import os
import argparse
import json
from langchain_community.llms.ollama import Ollama
from main import model
from upload2 import QA_FOLDER, write_status

def summarize_text(text):
    """Generates a summary of the given text without adding extra information."""
    summary_prompt = f"Summarize the following text concisely without adding any information:\n\n{text}"
    summary_response = model.invoke(summary_prompt)
    return summary_response.strip()

def generate_qa(summary):
    """Generates question-answer pairs based on the summary using Ollama."""
    phi3_prompt = f"""
    Generate a series of concise yet informative question-answer pairs based on the following content:
    
    {summary}
    
    - Each question should be short but meaningful.
    - Each answer should be clear, well-explained, and directly informative.
    - Do NOT mention "the text" or refer to the source in any way.
    - Format the response strictly as follows:
      Q: *question*; A: *answer*\n
      Q: *question*; A: *answer*\n
      Q: *question*; A: *answer*\n
    
    Example format:
    Q: Who was the main figure?; A: The main figure was [Name], who played a crucial role in [Context].\n
    Q: What is the significance of the event?; A: The event marked a pivotal moment in history, leading to significant changes in [Field/Area].\n
    Q: When did the event occur?; A: The event took place in [Year], a year that witnessed several transformative developments.\n
    """
    qa_response = model.invoke(phi3_prompt)
    return qa_response.strip()

def process_file(file_path):
    """Processes a text file to generate a JSON file of question-answer pairs in a specific format."""    
    
    with open(file_path, "r", encoding="utf-8") as file:
        text = file.read()
        
    write_status("Analyzing the document...")
    summary = summarize_text(text)
    write_status("Document analyzed!")
    write_status("Generating question and answer pairs...")
    qa_text = generate_qa(summary)
    write_status("Question and answer pairs generated!")

    if not qa_text:
        write_status("[ERROR] No response generated for the Q&A.")
        return None
    
    qa_pairs = []
    for line in qa_text.split("\n"):
        try:
            if line.startswith("Q:") and "; A:" in line:
                question, answer = line.split("; A:")
                prompt = f"Q: {question.strip('Q: ').strip()}\nA: {answer.strip()}"
                qa_pairs.append({"prompt": prompt})
            elif line.strip():  # If line is non-empty but doesn't match Q&A format, treat as unstructured
                qa_pairs.append({"prompt": f"Unstructured: {line.strip()}"})
        except ValueError:
            # In case of any issues with splitting or processing, just log the error and include the line.
            write_status(f"Error processing line: {line}")
            qa_pairs.append({"prompt": f"Error processing line: {line.strip()}"})

    # Filter out any empty prompts that may still exist
    qa_pairs = [pair for pair in qa_pairs if pair["prompt"]]

    json_filename = "qa_" + os.path.basename(file_path).replace(".txt", ".json")
    json_path = os.path.join(QA_FOLDER, json_filename)
    
    with open(json_path, "w", encoding="utf-8") as json_file:
        for pair in qa_pairs:
            json.dump(pair, json_file, indent=None, ensure_ascii=False)
            json_file.write("\n")
    
    write_status(f"Q&A file generated: {json_path}")
    os.remove(file_path)
    
    return json_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--path", type=str, required=True, help="Path of the text file to process")
    args = parser.parse_args()
    
    if not os.path.exists(args.path):
        write_status("Error: The specified file does not exist.")
    else:
        process_file(args.path)
