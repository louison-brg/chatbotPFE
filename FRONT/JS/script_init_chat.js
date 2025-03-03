// Function to initialize the chat interface after Q&A selection
function initiateChat() {
    // Check if the chat container already exists
    const existingChatContainer = document.getElementById('chat-container');
    if (existingChatContainer) {
        // If the chat container exists, just open it and return
        openChat();
        return;
    }

    // Create the new chat container
    const chatContainer = document.createElement('div');
    chatContainer.id = 'chat-container';

    // Create the close button
    const closeButton = document.createElement('button');
    closeButton.id = 'close-chat';
    closeButton.innerHTML = '&times;'; // Cross symbol

    // Add close button to chat container
    chatContainer.appendChild(closeButton);

    // Create the chat output container
    const chatOutput = document.createElement('div');
    chatOutput.id = 'chat-output';
    chatContainer.appendChild(chatOutput);

    // Create the first bot message
    const firstMessage = document.createElement('div');
    firstMessage.classList.add('bot-message');
    firstMessage.id = 'first-message';
    firstMessage.textContent = 'Assistant: Hello, I am your personal assistant. Please provide me with your question.';
    chatOutput.appendChild(firstMessage);

    // Create the chat input container
    const chatInput = document.createElement('div');
    chatInput.id = 'chat-input';

    // Create the input field
    const userInput = document.createElement('input');
    userInput.type = 'text';
    userInput.id = 'user-input';
    userInput.placeholder = 'Type here...';

    // Create the microphone toggle button
    const micButton = document.createElement('button');
    micButton.classList.add('mic-toggle');
    micButton.id = 'mic';
    micButton.innerHTML = '<span class="material-icons">mic</span>';

    // Create the send button
    const sendButton = document.createElement('button');
    sendButton.classList.add('send-button');
    sendButton.id = 'send';
    sendButton.innerHTML = '<span class="material-icons">send</span>';

    // Append the input field, mic button, and send button to the chat input container
    chatInput.appendChild(userInput);
    chatInput.appendChild(micButton);
    chatInput.appendChild(sendButton);

    // Append the chat input container to the main chat container
    chatContainer.appendChild(chatInput);

    // Append the chat container to the body or another element
    document.body.appendChild(chatContainer);

    // Initially set height and opacity to trigger the animation
    chatContainer.style.height = '0';  
    chatContainer.style.opacity = '0';  

    // Close chat on close button click using the closeChat function
    closeButton.addEventListener('click', closeChat);

    // Open the chat container using the openChat function
    openChat();

    // Initialize chat setup
    setupChat();
}

// Function to open the chat with an animation
function openChat() {
    const chatContainer = document.getElementById('chat-container');
    const startChatButton = document.getElementById("start-button");
    startChatButton.style.display = "none";
    if (chatContainer) {
        // Initially set height and opacity to trigger the animation
        chatContainer.style.height = '0';  
        chatContainer.style.opacity = '0';
        chatContainer.style.display = "flex";  

        // Show the chat after a small delay to trigger the transition
        setTimeout(() => {
            chatContainer.style.transition = 'height 0.8s ease, opacity 0.5s ease';
            chatContainer.style.height = '60%';  // Set desired height
            chatContainer.style.opacity = '1';   // Fade in
        }, 10);
    }
}

// Function to close the chat with an animation
function closeChat() {
    const chatContainer = document.getElementById('chat-container');
    const startChatButton = document.getElementById("start-button");
    startChatButton.style.display = "flex";
    if (chatContainer) {
        chatContainer.style.transition = 'height 0.5s ease, opacity 0.5s ease';
        chatContainer.style.height = '0';  // Collapse height to 0
        chatContainer.style.opacity = '0'; // Fade out
        setTimeout(() => {
            chatContainer.style.display = "none"; 
        }, 500);
    }
    
}

// Call the function to request permission and initialize chat
window.onload = requestMicrophonePermissionAndInit;
