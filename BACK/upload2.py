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

# Define log file path for status updates
LOG_FILE = os.path.join(BASE_DIR, "process_status.log")

def clear_log_file():
    """Clear the contents of the log file at launch."""
    try:
        with open(LOG_FILE, 'w') as log_file:
            log_file.truncate(0)  # Clear the file content
        print("Log file cleared.")
    except Exception as e:
        print(f"Error clearing log file: {e}")

def write_status(message):
    """Write status updates to a log file."""
    with open(LOG_FILE, "a", encoding="utf-8") as log_file:
        log_file.write(f"\n")
        log_file.write(f"{message}")

ALLOWED_EXTENSIONS = {"txt", "pdf"}

def allowed_file(filename: str) -> bool:
    """ Check if the file has an allowed extension """
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def convert_pdf_to_txt(pdf_filename: str):
    """ Convert a PDF file to TXT using PDF_converter.py """
    txt_filename = pdf_filename.replace(".pdf", ".txt")
    txt_path = os.path.join(UPLOAD_FOLDER, txt_filename)
    pdf_path = os.path.join(UPLOAD_FOLDER, pdf_filename)

    if os.path.exists(txt_path):
        print(f"{txt_filename} already converted.")
        return txt_filename

    write_status(f"Converting {pdf_filename} to .txt...")

    if not os.path.exists(PDF_CONVERTER_SCRIPT):
        write_status(f"ERROR: PDF Converter script NOT FOUND at: {PDF_CONVERTER_SCRIPT}")
        return None

    process = subprocess.run(
        ["python", PDF_CONVERTER_SCRIPT, pdf_path, txt_path],
        capture_output=True,
        text=True
    )

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
    """ Handle file upload and automatic conversion if needed """
    if not allowed_file(file.filename):
        raise HTTPException(status_code=400, detail="Only .txt and .pdf files are allowed!")
    
    write_status(f"Uploading ...")

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    write_status(f"File uploaded: {file.filename}")

    if file.filename.endswith(".pdf"):
        txt_filename = convert_pdf_to_txt(file.filename)
        if not txt_filename:
            raise HTTPException(status_code=500, detail=f"Error converting {file.filename} to TXT")
    else:
        txt_filename = file.filename

    # Run qa_creator.py script in the background
    background_tasks.add_task(subprocess.run, ["python", QA_CREATOR_SCRIPT, "--path", os.path.join(UPLOAD_FOLDER, txt_filename)], capture_output=True, text=True)
    
    # After the JSON file is generated, remove the uploaded .txt and .pdf files
    background_tasks.add_task(os.remove, file_path)  # Remove the uploaded file
    
    if file.filename.endswith(".pdf"):
        pdf_file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        background_tasks.add_task(os.remove, pdf_file_path)  # Remove the uploaded PDF file

    return {"message": f"File {file.filename} processed. Generating Q&A."}

@app.get("/get_status")
async def get_status():
    """ Get the last status update from the process log file """
    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, "r", encoding="utf-8") as log_file:
            log_content = log_file.readlines()  # Read all lines from the log file
        if log_content:
            last_line = log_content[-1]  # Get the last line
            return {"status": last_line.strip()}  # Return the last line (remove any extra spaces or newlines)
        else:
            return {"status": ""}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000, reload=True)
