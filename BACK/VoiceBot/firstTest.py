import whisper

model = whisper.load_model("small.en")  # Change to "small", "medium", or "large" for better accuracy
result = model.transcribe("./lostpass.mp3")


print(result["text"])  # Print the transcribed text
