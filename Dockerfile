# Use the official Python 3.11
FROM python:3.11-slim

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies: Git, curl, ffmpeg, Rust, and Cargo
RUN apt-get update && apt-get install -y \
    git \
    curl \
    ffmpeg \
    rustc \
    cargo \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama using its installation script
RUN curl -fsSL https://ollama.com/install.sh | sh

# Set the working directory
WORKDIR /app

# Copy all project files into the container
COPY . .

# Upgrade pip and install Python dependencies using the requirements.txt file
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Expose the required ports:
# - Ollama API: 11434
# - Main FastAPI Server: 8000
# - Upload Server: 5000
EXPOSE 11434 8000 5000

# Copy the startup script and set the executable permission
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Run the startup script when the container starts
CMD ["/app/start.sh"]
