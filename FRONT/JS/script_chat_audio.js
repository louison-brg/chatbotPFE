// Track the recording state and recorder
let isRecording = false;
let mediaRecorder;
let audioBlob;

// Function to request microphone permission when the page loads
window.onload = () => {
    // Request microphone access as soon as the page is loaded
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            console.log("Microphone access granted.");
        })
        .catch(err => {
            console.error("Error accessing microphone: ", err);
            alert("Microphone access is required for audio features. Please grant permission.");
        });
};

// Function to handle the audio display and recording toggle
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
            mediaRecorder.start();

            mediaRecorder.ondataavailable = event => {
                audioBlob = event.data;  // Save the audio blob
                displayUserAudio(audioBlob);  // Display the audio in chat
            };
        })
        .catch(err => {
            console.error("Error accessing microphone: ", err);
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

// Function to display user audio message and send it to the server
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

    // Now, send the audio to the server for transcription
    displayBotListening();
    sendAudioToServer(audioBlob);  // Send the recorded audio to be transcribed
}

// Function to display "Bot is listening" message
function displayBotListening() {
    let chatOutput = document.getElementById('chat-output');
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'bot-loading';
    loadingMessage.id = 'bot-listening';  // Set an ID for easy removal/update
    loadingMessage.textContent = 'Assistant: *listening*';
    chatOutput.appendChild(loadingMessage);
    chatOutput.scrollTop = chatOutput.scrollHeight; // Scroll to the bottom
}

// Function to remove any "bot-loading" message (either listening or typing)
function removeBotLoading() {
    const loadingMessage = document.getElementById('bot-listening');
    if (loadingMessage) {
        loadingMessage.remove(); // Remove the "listening" message
    }

    const typingMessage = document.getElementById('bot-typing');
    if (typingMessage) {
        typingMessage.remove(); // Remove the "typing" message if it exists
    }
}

// Function to send the transcription of user audio to the bot
function sendTranscriptionToBot(transcription) {
    if (transcription.trim() === '') return; // Ensure there's input

    // Remove the "listening" message and show the "typing" message
    removeBotLoading();
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
