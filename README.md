# **ChatbotPFE**

This guide will walk you through the setup process for the ChatbotPFE project. You will install Ollama, create a Conda virtual environment, install necessary dependencies, and run the required servers for the project.
___
#### **Features**:

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

#### 1. Install Ollama:
Download the installer and follow the on-screen instructions to complete the installation of Ollama:  
[Download Ollama](https://ollama.com/download/windows)

#### 2. Install FFmpeg:
FFmpeg is required for audioprocessing. Follow these steps to download and set it up:

1. Download FFmpeg:
   - Go to [gyan.dev](https://www.gyan.dev/ffmpeg/builds/).
   - Download the "Essential" build.
   - Extract the zip file to a folder of your choice (e.g., `C:\path\to\ffmpeg`).

2. Add FFmpeg to your PATH:
   - **Windows**:
     1. Right-click on This PC (or My Computer) and select Properties.
     2. Click on Advanced system settings on the left sidebar.
     3. In the System Properties window, click the Environment Variables button.
     4. Under System Variables, find and select Path, then click Edit.
     5. In the Edit Environment Variable window, click New, and add the path to the bin directory inside your extracted FFmpeg folder (e.g., `C:\path\to\ffmpeg\bin`).
     6. Click OK to close the windows.

   - **macOS/Linux**:
     1. Open your terminal and edit the `.bashrc` (or `.zshrc` for Zsh users) file:
        ```bash
        nano ~/.bashrc  # For Bash shell users
        # or
        nano ~/.zshrc  # For Zsh shell users
        ```
     2. Add the following line at the end of the file:
        ```bash
        export PATH="/path/to/ffmpeg/bin:$PATH"
        ```
     3. Replace `/path/to/ffmpeg/bin` with the actual path where you extracted FFmpeg.
     4. Save and close the file (`Ctrl + X`, then `Y` to confirm).
     5. Run `source ~/.bashrc` or `source ~/.zshrc` to apply the changes.

#### 3. Install Conda:
If you don't have Conda installed, download and install Anaconda:  
[Download Anaconda](https://www.anaconda.com/products/individual)
___

## **Installation** :

#### 1. Create a new Conda environment :
- Create a new Conda environment named `chatbotPFE` :
```bash
conda create --name chatbotPFE python=3.10
```
- Activate the environment :
```bash
conda activate chatbotPFE
```

#### 2. Clone the project and install dependencies :
- Clone the project :
```bash
git clone https://github.com/Pyveslefebvre/chatbotPFE.git
```
- Navigate to the project directory :
```bash
cd chatbotPFE
```
- Install dependencies :
```bash
pip install -r requirements.txt
```

#### 3. Pull the Ollama models :
- Pull the **phi3** model:
This model is used by our chatbot to generate Q&A. It processes the Q&A pairs that are created and stored by the **LightRAG** system, enabling the chatbot to provide appropriate responses based on the available information.


```bash
ollama pull phi3
```

- Pull the **qwen2** model :
This model is used by our **LightRAG** system. It reads documents (such as PDFs or TXT files), extracts relevant information, and generates Q&A pairs that are then used by the **phi3** model to answer user queries.

```bash
ollama pull qwen2
```

- Pull the **nomic-embed-text** model:  
  This model is used by our **LightRAG** system and for embedding when you send a voice chat.  
  The **nomic-embed-text** model helps to process and embed text, ensuring that the bot can handle voice input effectively by converting it into actionable information for the Q&A system.

```bash
ollama pull nomic-embed-text
```
*You can use other models if you want, but keep in mind that you’ll need to update the code wherever the model is used.*
___
# **Run** :

- Run **Ollama** server:
Launch the server :
```bash
ollama serve
```

- Run the **FastAPI** server :
Start the main.py
```bash
python ./BACK/main.py
```

- Open the frontend :
Open [http://localhost:8000/chat-page](http://localhost:8000/chat-page) in your browser.

#### **How to use**:

1. **Enable your microphone** for voice chat:  
   In order to use the voice interaction feature, make sure your microphone is enabled and that you have granted the necessary permissions to the browser/application (it should ask for the permission on launch).

2. **Menu**:  
   The **Menu** provides options to manage the Q&A and content the bot will reference:
   - **Choose the Q&A**:  
     - Click on the **Menu** to open the options.
     - Select the Q&A (.json) that you want the bot to use. This will determine the content the bot will reference when answering questions.
   - **Create a new Q&A by uploading a document**:  
     - You can create a new Q&A file by uploading a **PDF** or **TXT** document.  
     - The bot will process the document and generate a new Q&A (.json) based on the contents of the file.

3. **Start chatting**:  
   - After choosing or creating a Q&A, click the button to open the chatbot interface at the bottom.
   - You can **ask the chatbot questions** either by typing your input in the text box or **recording your voice** to send an audio input for the chatbot to process. To record your voice, press the mic icon once to start recording, and press it again to stop the recording.

#### **Chat with the bot on other devices  on a local network**:
Check your local ipV4 in the cmd.
- Windows
```bash
ipconfig
``` 
- MacOS and Linux
```bash
ifconfig
``` 
Type this address in the client browser.
```bash
http://<your-local-ipV4>:8000/chat-page
``` 
___
#### Testing the Setup:
- **Ollama Server**: [http://localhost:11434](http://localhost:11434)  
- **FastAPI Server**: [http://localhost:8000/docs](http://localhost:8000/docs)

___
#### **Authors**

- [@pyveslefebvre](https://www.github.com/pyveslefebvre)
- [@louison-brg](https://www.github.com/louison-brg)