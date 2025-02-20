function sendMessage() {
    let userInput = document.getElementById('user-input').value;
    if (userInput.trim() === '') return; // Ensure there's input

    // Display user message
    let chatOutput = document.getElementById('chat-output');
    let userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.textContent = 'You : ' + userInput;
    chatOutput.appendChild(userMessage);

    // Display "bot is typing" message
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'bot-loading';
    loadingMessage.textContent = 'Assistant : *typing*';
    chatOutput.appendChild(loadingMessage);
    chatOutput.scrollTop = chatOutput.scrollHeight;

    // Send message to FastAPI server at the /chat endpoint
    fetch('/chat', {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput })
    })
        .then(response => {
            if (!response.ok) {
                console.error('Error response status:', response.status);
                return response.json().then(errData => {
                    throw new Error('Network response was not ok: ' + JSON.stringify(errData));
                });
            }
            return response.json(); // Parse the JSON from the response
        })
        .then(data => {
            // Find the last bot-message element and update it with the actual bot response
            let botMessages = document.querySelectorAll('.bot-loading');
            let lastBotMessage = botMessages[botMessages.length - 1]; // Get the last created bot-message
            lastBotMessage.textContent = 'Assistant : ' + data.response; // Update its content with the bot response
            // Change the class from 'bot-loading' to 'bot-message' after the response is received
            lastBotMessage.classList.remove('bot-loading');  // Remove the 'bot-loading' class
            lastBotMessage.classList.add('bot-message');  // Add the 'bot-message' class to apply normal bot message styling

        })
        .catch(error => {
            console.error('Error:', error); // Log any errors to console
            // Find the last bot-message element and update it with an error message
            let botMessages = document.querySelectorAll('.bot-loading');
            let lastBotMessage = botMessages[botMessages.length - 1]; // Get the last created bot-message
            lastBotMessage.textContent = 'Assistant : Sorry, there was an error processing your request. Please reload this page.';
            lastBotMessage.classList.remove('bot-loading');  // Remove the 'bot-loading' class
            lastBotMessage.classList.add('bot-message');  // Add the 'bot-message' class to apply normal bot message styling

        });

    // Reset input field
    document.getElementById('user-input').value = ''; // Clear input field
}

// Add event listener on the send button
document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.querySelector('#send_button');
    sendButton.addEventListener('click', sendMessage);

    // Listener for the Enter key
    const userInput = document.getElementById('user-input');
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            sendMessage(); // Call the send function
        }
    });
});