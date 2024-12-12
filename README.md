
# ChatbotPFE

This guide will walk you through the setup process for the ChatbotPFE project.
You will install Ollama, create a Conda virtual environment, install necessary dependencies, 
and run the required servers for the project.

## Pre-requieres :

#### 1. Install Ollama :
Download the installer and follow the on-screen instructions to complete the installation :  
https://ollama.com/download/windows

#### 2. Install Conda :
If you don't have Conda installed, download and install Anaconda : https://www.anaconda.com/products/individual 

## Installation :

#### 1. Create a new Conda environment :
- Create a new Conda environnement named chatbotPFE :
```bash
conda create --name chatbotPFE python=3.10
```
- Activate the environment :
```bash
conda activate chatbotPFE
```

#### 2. Clone the project and dependencies :
- Clone the project :
```bash
git clone https://github.com/Pyveslefebvre/chatbotPFE.git
```   
- Go to the project directory :
```bash
  cd chatbotPFE
```
- Install dependencies :
```bash
  pip install -r requirements.txt
```

#### 3. Pull Ollama model :
- Pull phi3 model (the model we're using in our project) :
```bash
  ollama pull phi3
```

## RUN :

- Run Ollama server :
```bash
  ollama serve
```
- Run FastAPI server :
```bash
  fastapi dev .\BACK\main.py --reload --port 8000
```
- Run the frontend :
Open 'chat.html' in your browser.  

- Chat with the bot :
...

#### Testing the Setup :
Ollama Server: http://localhost:11434  
FastAPI Server: http://localhost:8000/docs
## Authors

- [@pyveslefebvre](https://www.github.com/pyveslefebvre)
- [@louison-brg](https://www.github.com/louison-brg)

