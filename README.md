# ChatbotPFE

This guide will walk you through the setup process for the **ChatbotPFE** project. You will install **Ollama**, create a Conda virtual environment, install necessary dependencies, and run the required servers for the project.

## Prerequisites

#### 1. Install Ollama:
Download the installer and follow the on-screen instructions to complete the installation of **Ollama**:  
[Download Ollama](https://ollama.com/download/windows)

#### 2. Install Conda:
If you don't have Conda installed, download and install **Anaconda**:  
[Download Anaconda](https://www.anaconda.com/products/individual)


## Installation

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

## Ollama Models :
- Pull the **phi3** model:
This model is used by our chatbot and to generate Q&A.
```bash
ollama pull phi3
```
- Pull the **qwen2** model :
This model is used by our **LightRAG** system.
```bash
ollama pull qwen2
```
- Pull the **nomic-embed-text** model :
This model is used by our **LightRAG** system.
```bash
ollama pull nomic-embed-text
```
*You can use other models if you want, but keep in mind that you’ll need to update the code wherever the model is used.*

## Run :

### 1. **LightRAG** :
Here we want to use an unstructured text file (.txt) to generate Q&A ().json), which will then be used by our Chatbot in the **RAG** system.

If you already have a .json file with your Q&A, you can skip this step.

- Download a text file (.txt) and save it in `./BACK/datasets/`
- Start the **Ollama** server :
```bash
ollama serve
```
- Execute **LightRAG** :
```bash
python ./BACK/LightRAG/lightrag_ollama.py --path ./BACK/datasets/<name-of-your-document.txt>
```

This will generate a Q&A .json file in `./BACK/datasets/qa/`.

#### OR 

You can run this command in the BACK directory in a new terminal.
```bash
uvicorn upload:app --host 0.0.0.0 --port 5000 --reload
```
Then you can directly go to the page and load your file from the browser.

### 2. **Chatbot** :
Once you have the Q&A in .json format, you can launch your chatbot.

- Run **Ollama** server:
If the server has stopped, launch it again:
```bash
ollama serve
```

- Run the **FastAPI** server :
Here you can change your Q&A just by specifying another file.
```bash
python ./BACK/main.py --qa ./BACK/datasets/qa/<name-of-your-document.json>
```

- Open the frontend :
Open [http://localhost:8000/chat-page](http://localhost:8000/chat-page) in your browser.

#### Chat with the bot on other devices on a local network:
Check your local ipV4 in the cmd.
- Windows
```bash
ipconfig
``` 
- MacOS and Linux
```bash
ifconfig
``` 
Then type this address in the client browser.
```bash
http://<your-local-ipV4>:8000/chat-page
``` 

#### Testing the Setup:
- **Ollama Server**: [http://localhost:11434](http://localhost:11434)  
- **FastAPI Server**: [http://localhost:8000/docs](http://localhost:8000/docs)

## Authors

- [@pyveslefebvre](https://www.github.com/pyveslefebvre)
- [@louison-brg](https://www.github.com/louison-brg)