import os
import subprocess
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware

# Set base directory relative to this script
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "datasets")
QA_FOLDER = os.path.join(BASE_DIR, "datasets", "qa")
PDF_CONVERTER_SCRIPT = os.path.join(UPLOAD_FOLDER, "PDF_converter.py")
QA_CREATOR_SCRIPT = os.path.join(BASE_DIR, "qa_creator.py")

# Ensure required directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(QA_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {"txt", "pdf"}

def allowed_file(filename: str) -> bool:
    """ Vérifie si le fichier a une extension autorisée """
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

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

    return txt_filename if process.returncode == 0 else None

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
    
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    print(f"Fichier uploadé: {file.filename}")

    if file.filename.endswith(".pdf"):
        txt_filename = convert_pdf_to_txt(file.filename)
        if not txt_filename:
            raise HTTPException(status_code=500, detail=f"Erreur lors de la conversion du fichier {file.filename} en TXT")
    else:
        txt_filename = file.filename

    # Lancer le script qa_creator.py en arrière-plan
    background_tasks.add_task(subprocess.run, ["python", QA_CREATOR_SCRIPT, "--path", os.path.join(UPLOAD_FOLDER, txt_filename)], capture_output=True, text=True)
    
    # Après la génération du fichier JSON, supprimer les fichiers .txt et .pdf uploadés
    background_tasks.add_task(os.remove, file_path)  # Supprimer le fichier uploadé
    print(f"Fichier uploadé supprimé : {file_path}")
    
    if file.filename.endswith(".pdf"):
        pdf_file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        background_tasks.add_task(os.remove, pdf_file_path)  # Supprimer le fichier PDF s'il a été uploadé
        print(f"Fichier PDF supprimé : {pdf_file_path}")

    return {"message": f"Fichier {file.filename} traité. Génération du Q&A en cours."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000, reload=True)
