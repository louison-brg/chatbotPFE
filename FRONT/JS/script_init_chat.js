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
    micButton.innerHTML = '<span class="material-icons">mic</span>'; // Mic icon

    // Create the send button
    const sendButton = document.createElement('button');
    sendButton.classList.add('send-button');
    sendButton.id = 'send';
    sendButton.innerHTML = '<span class="material-icons">send</span>'; // Send icon

    // Append the input field, mic button, and send button to the chat input container
    chatInput.appendChild(userInput);
    chatInput.appendChild(micButton);
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

// Call the function to request permission and initialize chat
window.onload = requestMicrophonePermissionAndInit;
