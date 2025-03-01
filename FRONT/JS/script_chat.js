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

// Setup chat - Add the necessary event listeners or functionality for chat
function setupChat() {
    const userInput = document.getElementById('user-input');
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            sendMessage(userInput.value); // Call the send function
        }
    });

    // Handle the microphone button to start/stop recording
    const micButton = document.getElementById('mic');
    micButton.addEventListener('click', toggleRecording);

    // Handle the send button to send message
    const sendButton = document.getElementById('send');
    sendButton.addEventListener('click', () => {
        sendMessage(userInput.value); // Call sendMessage when the send button is clicked
    });
}

// Track the recording state and recorder
let isRecording = false;
let mediaRecorder;
let audioBlob;

// Update the toggleRecording function to handle the audio display
function toggleRecording() {
    const micButton = document.getElementById('mic');

    if (isRecording) {
        stopRecording();
        micButton.innerHTML = '<span class="material-icons">mic</span>'; // Reset to mic icon
    } else {
        startRecording();
        micButton.innerHTML = '<span class="material-icons">stop</span>'; // Change to stop icon
    }

    isRecording = !isRecording;
}

// Function to start recording the audio
function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = (event) => {
                audioBlob = event.data;
            };
            mediaRecorder.onstop = () => {
                // Send the audio file to the server for transcription once recording is stopped
                sendAudioToServer(audioBlob);
            };

            // Start recording
            mediaRecorder.start();
            console.log("Recording started");
        })
        .catch(error => {
            console.error("Error accessing microphone: ", error);
        });
}

// Function to stop recording
function stopRecording() {
    mediaRecorder.stop();
    console.log("Recording stopped");
}

// Function to send the audio blob and its transcription to the server
function sendAudioToServer(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recorded_audio.ogg');  // Attach the recorded audio as a file

    fetch('/transcribe', {  // Call the new endpoint '/transcribe' for audio transcription
        method: 'POST',
        body: formData,  // Send the form data which includes the audio file
    })
        .then(response => response.json())
        .then(data => {
            if (data.transcription) {
                // Send transcribed text to the chatbot as if it's the user's input
                sendTranscriptionToBot(data.transcription);  // Call sendTranscriptionToBot to send the transcription
            } else {
                console.error('Transcription failed', data);
            }
        })
        .catch(error => {
            console.error('Error while sending audio for transcription:', error);
        });
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
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'bot-loading';
    loadingMessage.textContent = 'Assistant: *typing*';
    chatOutput.appendChild(loadingMessage);
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

// Function to display user audio message
function displayUserAudio(audioBlob) {
    let chatOutput = document.getElementById('chat-output');
    let userAudioMessage = document.createElement('div');
    userAudioMessage.className = 'user-audio-message';

    // Create an audio player to play the recorded audio
    const audioPlayer = document.createElement('audio');
    audioPlayer.controls = true;
    audioPlayer.src = URL.createObjectURL(audioBlob);  // Use the recorded blob as the audio source

    // Add the audio player to the chat
    userAudioMessage.appendChild(audioPlayer);
    chatOutput.appendChild(userAudioMessage);
    chatOutput.scrollTop = chatOutput.scrollHeight; // Scroll to the bottom
}

// Function to send the transcription of user audio to the bot
function sendTranscriptionToBot(transcription) {
    if (transcription.trim() === '') return; // Ensure there's input

    // Display the user audio message instead of text
    displayUserAudio(audioBlob);

    // Display "bot is typing" message
    displayBotTyping();

    // Send transcription (not the audio) to FastAPI server at the /chat endpoint
    fetch('/chat', {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: transcription })
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
