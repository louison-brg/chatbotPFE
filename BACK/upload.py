#This script uses "LightRAG"
import os
import subprocess
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware

# Set base directory relative to this script
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Define paths relative to the `BACK` folder
UPLOAD_FOLDER = os.path.join(BASE_DIR, "datasets")
QA_FOLDER = os.path.join(BASE_DIR, "datasets", "qa")
LIGHTRAG_DIR = os.path.join(BASE_DIR, "LightRAG")
LIGHTRAG_SCRIPT = os.path.join(LIGHTRAG_DIR, "lightrag_ollama.py")
PDF_CONVERTER_SCRIPT = os.path.join(UPLOAD_FOLDER, "PDF_converter.py")

# Ensure required directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(QA_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {"txt", "pdf"}

def allowed_file(filename: str) -> bool:
    """ Vérifie si le fichier a une extension autorisée """
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_qa_json(txt_filename: str):
    """ Convertit un fichier .txt en JSON Q&A avec LightRAG, puis supprime les fichiers sources """
    json_filename = txt_filename.replace(".txt", ".json")
    json_path = os.path.join(QA_FOLDER, json_filename)
    txt_path = os.path.join(UPLOAD_FOLDER, txt_filename)
    pdf_filename = txt_filename.replace(".txt", ".pdf")
    pdf_path = os.path.join(UPLOAD_FOLDER, pdf_filename)

    if os.path.exists(json_path):
        print(f"{json_filename} existe déjà. Pas besoin de le recréer.")
        # Cleanup original files if they exist
        if os.path.exists(txt_path):
            os.remove(txt_path)
            print(f"Deleted original TXT file: {txt_filename}")
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
            print(f"Deleted original PDF file: {pdf_filename}")
        return json_filename

    print(f"Génération du Q&A JSON pour {txt_filename}...")

    if not os.path.exists(LIGHTRAG_SCRIPT):
        print(f"ERROR: LightRAG script NOT FOUND at: {LIGHTRAG_SCRIPT}")
        return None

    process = subprocess.run(
        ["python", LIGHTRAG_SCRIPT, "--path", txt_path],
        cwd=LIGHTRAG_DIR,  # Ensure correct working directory
        capture_output=True,
        text=True
    )

    print(f"LightRAG output: {process.stdout}")
    print(f"LightRAG error: {process.stderr}")

    if process.returncode == 0:
        print(f"Fichier Q&A généré: {json_filename}")
        # Delete original files after successful JSON creation
        if os.path.exists(txt_path):
            os.remove(txt_path)
            print(f"Deleted original TXT file: {txt_filename}")
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
            print(f"Deleted original PDF file: {pdf_filename}")
        return json_filename
    else:
        print(f"Erreur lors de la génération du fichier Q&A: {process.stderr}")
        return None

def convert_pdf_to_txt(pdf_filename: str):
    """ Convertit un fichier PDF en TXT en utilisant PDF_converter.py """
    txt_filename = pdf_filename.replace(".pdf", ".txt")
    txt_path = os.path.join(UPLOAD_FOLDER, txt_filename)
    pdf_path = os.path.join(UPLOAD_FOLDER, pdf_filename)

    if os.path.exists(txt_path):
        print(f"{txt_filename} déjà converti.")
        return txt_filename

    print(f"Conversion de {pdf_filename} en .txt...")

    if not os.path.exists(PDF_CONVERTER_SCRIPT):
        print(f"ERROR: PDF Converter script NOT FOUND at: {PDF_CONVERTER_SCRIPT}")
        return None

    process = subprocess.run(
        ["python", PDF_CONVERTER_SCRIPT, pdf_path, txt_path],
        capture_output=True,
        text=True
    )

    print(f"PDF Converter output: {process.stdout}")
    print(f"PDF Converter error: {process.stderr}")

    if process.returncode == 0:
        print(f"Conversion terminée: {txt_filename}")
        return txt_filename
    else:
        print(f"Erreur lors de la conversion PDF -> TXT: {process.stderr}")
        return None

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload/")
async def upload_file(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """ Gère l'upload du fichier et déclenche la conversion automatique """
    if not allowed_file(file.filename):
        raise HTTPException(status_code=400, detail="Seuls les fichiers .txt et .pdf sont autorisés !")

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    # Sauvegarde du fichier
    with open(file_path, "wb") as f:
        f.write(await file.read())

    print(f"Fichier uploadé: {file.filename}")

    if file.filename.endswith(".txt"):
        background_tasks.add_task(generate_qa_json, file.filename)
        return {"message": f"Fichier {file.filename} uploadé et Q&A en cours de génération."}

    elif file.filename.endswith(".pdf"):
        txt_filename = convert_pdf_to_txt(file.filename)
        if txt_filename:
            background_tasks.add_task(generate_qa_json, txt_filename)
            return {"message": f"Fichier {file.filename} converti en TXT et Q&A en cours de génération."}
        else:
            raise HTTPException(status_code=500, detail=f"Erreur lors de la conversion du fichier {file.filename} en TXT")

    return {"message": f"Fichier {file.filename} uploadé avec succès !"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
