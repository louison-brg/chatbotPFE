// Setup chat - Add the necessary event listeners or functionality for chat
function setupChat() {
    const userInput = document.getElementById('user-input');
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            sendMessage(userInput.value); // Call the send function
        }
    });

    // Handle the send button to send message
    const sendButton = document.getElementById('send');
    sendButton.addEventListener('click', () => {
        sendMessage(userInput.value); // Call sendMessage when the send button is clicked
    });

    // Handle the microphone button to start/stop recording
    const micButton = document.getElementById('mic');
    micButton.addEventListener('click', toggleRecording);
}

// Function to display user message
function displayUserMessage(userInput) {
    let chatOutput = document.getElementById('chat-output');
    let userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.textContent = 'You : ' + userInput;
    chatOutput.appendChild(userMessage);
    chatOutput.scrollTop = chatOutput.scrollHeight; // Scroll to the bottom
}

// Function to display "Bot is typing" message
function displayBotTyping() {
    let chatOutput = document.getElementById('chat-output');
    const typingMessage = document.createElement('div');
    typingMessage.className = 'bot-loading';
    typingMessage.id = 'bot-typing';  // Set an ID for easy removal/update
    typingMessage.textContent = 'Assistant: *typing*';
    chatOutput.appendChild(typingMessage);
    chatOutput.scrollTop = chatOutput.scrollHeight; // Scroll to the bottom
}

// Function to send a message
function sendMessage(userInput) {
    if (userInput.trim() === '') return; // Ensure there's input

    // Display user message
    displayUserMessage(userInput);

    // Display "bot is typing" message
    displayBotTyping();

    // Send message to FastAPI server at the /chat endpoint
    fetch('/chat', {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput })
    })
        .then(response => response.json())
        .then(data => {
            let botMessages = document.querySelectorAll('.bot-loading');
            let lastBotMessage = botMessages[botMessages.length - 1];
            lastBotMessage.textContent = 'Assistant: ' + data.response;
            lastBotMessage.classList.remove('bot-loading');
            lastBotMessage.classList.add('bot-message');
        })
        .catch(error => {
            console.error('Error:', error);
            let botMessages = document.querySelectorAll('.bot-loading');
            let lastBotMessage = botMessages[botMessages.length - 1];
            lastBotMessage.textContent = 'Assistant: Sorry, there was an error processing your request.';
            lastBotMessage.classList.remove('bot-loading');
            lastBotMessage.classList.add('bot-message');
        });

    // Reset input field
    document.getElementById('user-input').value = '';  // Clear input field
}
