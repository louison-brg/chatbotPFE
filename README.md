# **ChatbotPFE**

This guide will walk you through the setup process for the ChatbotPFE project. You will install Ollama, create a Conda virtual environment, install necessary dependencies, and run the required servers for the project.

___
  
Click on the image below to watch the demonstration video:

[![Demonstration video](https://drive.google.com/thumbnail?id=1umnWB7yB8Jd50RmelQnJUBm_Lox-S47O)](https://drive.google.com/file/d/1umnWB7yB8Jd50RmelQnJUBm_Lox-S47O/view?usp=sharing)

___

## **Features**:

- **Chat with your personal AI assistant**:  
  The AI assistant can access a set of selected Q&As from your documents. This allows for personalized and accurate responses based on the content of your documents.

- **Choose the Q&A the bot has in mind**:  
  In the menu, you can **select** a pre-existing Q&A file (.json) that the bot will reference when answering questions. This allows you to control which set of Q&As the bot uses to generate responses.

- **Create your own Q&A by uploading a document**:  
  You can upload files in **PDF** or **TXT** formats. Once uploaded, the bot will automatically process the file and generate a new Q&A file (.json) based on the content of the document. This new Q&A can be added to the bot’s knowledge base.

- **Send either text or voice input to the bot**:  
   You can interact with the bot using **text input** by typing your questions in the chat. Alternatively, you can **send voice input**, and the bot will process your voice and respond in **text**. This gives you the flexibility to communicate in whichever way is most convenient.

___

## **Prerequisites**

### 1. Install Ollama:
Download the installer and follow the on-screen instructions to complete the installation of Ollama:  
[Download Ollama](https://ollama.com/download/windows)

### 2. Install FFmpeg:
FFmpeg is required for audioprocessing. Follow these steps to download and set it up:

1. Download FFmpeg:
   - Go to [gyan.dev](https://www.gyan.dev/ffmpeg/builds/).
   - Download the "Essential" build: `ffmpeg-git-essentials.7z`
   - Extract the zip file to a folder of your choice (e.g., `C:\path\to\ffmpeg`).

2. Add FFmpeg to your PATH:

   **For Windows**:
   - Open PowerShell and execute the following command:
     ```bash
     notepad C:\path\to\anaconda3\envs\chatbotPFE\etc\conda\activate.d\env_vars.bat
     ```
   - It will open Notepad. Write this line in the file and save it:
     ```bash
     set PATH=C:\path\to\ffmpeg\bin;%PATH%
     ```
   - Restart your Anaconda environment and code editor.
   - Check if ffmpeg is correclty setup by running this command in the chatbotPFE env:
     ```bash
     ffmpeg -version
     ```

   **For macOS/Linux**:
   - Open your terminal and execute the following command:
     ```bash
     nano ~/anaconda3/envs/chatbotPFE/etc/conda/activate.d/env_vars.sh
     ```
   - It will open a text editor. Write this line in the file and save it:
     ```bash
     export PATH="/path/to/ffmpeg/bin:$PATH"
     ```
   - Replace `/path/to/ffmpeg/bin` with the actual path where you extracted FFmpeg.
   - Restart your Anaconda environment and code editor.
   - Check if ffmpeg is correctly setup by running this command in the chatbotPFE env:
     ```bash
     ffmpeg -version
     ```

### 3. Install Conda:
If you don't have Conda installed, download and install Anaconda:  
[Download Anaconda](https://www.anaconda.com/products/individual)

___

## **Installation**

### 1. Create a new Conda environment:
- Create a new Conda environment named `chatbotPFE`:
  ```bash
  conda create --name chatbotPFE python=3.10
  ```
- Activate the environment:
  ```bash
  conda activate chatbotPFE
  ```

### 2. Clone the project and install dependencies:
- Clone the project:
  ```bash
  git clone https://github.com/Pyveslefebvre/chatbotPFE.git
  ```
- Navigate to the project directory:
  ```bash
  cd chatbotPFE
  ```
- Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```

### 3. Pull the Ollama models:
- Pull the **phi3** model:
  ```bash
  ollama pull phi3
  ```
- Pull the **qwen2** model:
  ```bash
  ollama pull qwen2
  ```
- Pull the **nomic-embed-text** model:
  ```bash
  ollama pull nomic-embed-text
  ```

*You can use other models if you want, but keep in mind that you’ll need to update the code wherever the model is used.*

___

## **Run**

### 1. Run **Ollama** server:
Launch the server:
```bash
ollama serve
```

### 2. Run the **FastAPI** server:
Start the main.py:
```bash
python ./BACK/main.py
```

### 3. Open the frontend:
Open [http://localhost:8000/chat-page](http://localhost:8000/chat-page) in your browser.

___

## **How to use**

### 1. Enable your microphone for voice chat:
In order to use the voice interaction feature, make sure your microphone is enabled and that you have granted the necessary permissions to the browser/application (it should ask for the permission on launch).

### 2. Menu:
The **Menu** provides options to manage the Q&A and content the bot will reference:
- **Choose the Q&A**:
  - Click on the **Menu** to open the options.
  - Select the Q&A (.json) that you want the bot to use. This will determine the content the bot will reference when answering questions.
- **Create a new Q&A by uploading a document**:
  - You can create a new Q&A file by uploading a **PDF** or **TXT** document.
  - The bot will process the document and generate a new Q&A (.json) based on the contents of the file.

### 3. Start chatting:
- After choosing or creating a Q&A, click the button to open the chatbot interface at the bottom.
- You can **ask the chatbot questions** either by typing your input in the text box or **recording your voice** to send an audio input for the chatbot to process. To record your voice, press the mic icon once to start recording, and press it again to stop the recording.

___

## **Chat with the bot on other devices on a local network**

Check your local IPv4 in the cmd.
- Windows:
  ```bash
  ipconfig
  ```
- macOS and Linux:
  ```bash
  ifconfig
  ```
Type this address in the client browser:
```bash
http://<your-local-ipv4>:8000/chat-page
```

___

## **Testing the Setup**

- **Ollama Server**: [http://localhost:11434](http://localhost:11434)
- **FastAPI Server**: [http://localhost:8000/docs](http://localhost:8000/docs)

___

## **Authors**

- [@pyveslefebvre](https://www.github.com/pyveslefebvre)
- [@louison-brg](https://www.github.com/louison-brg)
