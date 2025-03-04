# Use Ubuntu as the base image
FROM ubuntu:20.04
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies: Python, pip, curl, ffmpeg, etc.
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    curl \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama using its installation script
RUN curl -fsSL https://ollama.com/install.sh | sh

# Set the working directory
WORKDIR /app

# Copy all project files into the container
COPY . .

# Install Python dependencies using pip3
RUN pip3 install --no-cache-dir -r requirements.txt

# Expose the required ports:
# - Ollama API: 11434
# - Main FastAPI Server: 8000
# - Upload Server: 5000
EXPOSE 11434 8000 5000

# Copy and set permissions for the startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Run the startup script when the container starts
CMD ["/app/start.sh"]
