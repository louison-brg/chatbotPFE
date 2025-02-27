// Function to initialize the chat interface after Q&A selection
function initiateChat() {

    // Create the new chat container
    const chatContainer = document.createElement('div');
    chatContainer.id = 'chat-container';

    // Create the chat output container
    const chatOutput = document.createElement('div');
    chatOutput.id = 'chat-output';
    chatContainer.appendChild(chatOutput);

    // Create the first bot message
    const firstMessage = document.createElement('div');
    firstMessage.classList.add('bot-message');
    firstMessage.id = 'first-message';
    firstMessage.textContent = 'Assistant : Hello, I am your personal assistant. Please provide me with your question.';
    chatOutput.appendChild(firstMessage);

    // Create the chat input container
    const chatInput = document.createElement('div');
    chatInput.id = 'chat-input';

    // Create the input field
    const userInput = document.createElement('input');
    userInput.type = 'text';
    userInput.id = 'user-input';
    userInput.placeholder = 'Type here...';

    // Create the send button
    const sendButton = document.createElement('button');
    sendButton.id = 'send_button';
    sendButton.textContent = 'Send';

    // Append the input and button to the chat input container
    chatInput.appendChild(userInput);
    chatInput.appendChild(sendButton);

    // Append the chat input container to the main chat container
    chatContainer.appendChild(chatInput);

    // Append the chat container to the body or another element
    document.body.appendChild(chatContainer);

    // Initially set height and opacity to trigger the animation
    chatContainer.style.height = '0';  // Initially collapsed
    chatContainer.style.opacity = '0';  // Initially invisible

    // Delay the transition by setting styles after the container is appended to DOM
    setTimeout(() => {
        chatContainer.style.transition = 'height 0.8s ease, opacity 0.5s ease';  // Ensure transition is applied
        chatContainer.style.height = '60%';  // Increase the height
        chatContainer.style.opacity = '1';  // Fade in
    }, 10);  // 10ms delay to allow the DOM to register the element

    // Now you can initialize your chat (perhaps add event listeners, etc.)
    setupChat();
}

// Setup chat - Add the necessary event listeners or functionality for chat
function setupChat() {
    // This would be where you set up the chat functionality, like sending messages.
    const sendButton = document.getElementById('send_button');
    sendButton.addEventListener('click', sendMessage);

    const userInput = document.getElementById('user-input');
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            sendMessage(); // Call the send function
        }
    });
}

// Function to send a message (same as you already had in your code)
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
