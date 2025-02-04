from pdfminer.high_level import extract_text

pdf_path = "BACK\datasets\DIPA-AssuranceAuto.pdf"
txt_path = "AssuranceAuto.txt"

text = extract_text(pdf_path)

with open(txt_path, "w", encoding="utf-8") as txt_file:
    txt_file.write(text)

print("Conversion completed successfully!")
