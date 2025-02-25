import sys
from pdfminer.high_level import extract_text

if len(sys.argv) < 3:
    print("Usage: python PDF_converter.py <input_pdf_path> <output_txt_path>")
    sys.exit(1)

pdf_path = sys.argv[1]  
txt_path = sys.argv[2]  

print(f"Converting {pdf_path} to {txt_path}...")

try:
    text = extract_text(pdf_path)
    with open(txt_path, "w", encoding="utf-8") as txt_file:
        txt_file.write(text)
    print("Conversion completed successfully!")
except Exception as e:
    print(f"Conversion failed: {e}")
    sys.exit(1)
