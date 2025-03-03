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
function sendAudioToServer(audioBlob, transcriptButton, transcriptMessage) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recorded_audio.ogg');  // Attach the recorded audio as a file

    fetch('/transcribe', {  // Call the new endpoint '/transcribe' for audio transcription
        method: 'POST',
        body: formData,  // Send the form data which includes the audio file
    })
        .then(response => response.json())
        .then(data => {
            if (data.transcription) {
                // Update the transcript button and transcript message with the transcribed text
                transcriptButton.classList.remove('hidden');  // Make the button visible
                // Update the transcript content
                transcriptMessage.textContent = data.transcription;
                sendTranscriptionToBot(data.transcription);
            } else {
                console.error('Transcription failed', data);
            }
        })
        .catch(error => {
            console.error('Error while sending audio for transcription:', error);
        });
}

function displayUserAudio(audioBlob) {
    let chatOutput = document.getElementById('chat-output');

    // Create the main container for the user audio message, button, and transcription
    let audioContainer = document.createElement('div');
    audioContainer.className = 'audio-container';  // Style for this container

    // Generate unique IDs for audio and transcript
    const audioId = `audio-${Date.now()}`;
    const transcriptId = `transcript-${Date.now()}`;

    // Create an audio player to play the recorded audio
    const audioPlayer = document.createElement('audio');
    audioPlayer.id = audioId;  // Assign the generated audio ID
    audioPlayer.controls = true;
    audioPlayer.src = URL.createObjectURL(audioBlob);  // Use the recorded blob as the audio source

    // Create the button to toggle transcript visibility (Initially hidden)
    const transcriptButton = document.createElement('button');
    transcriptButton.className = 'transcript-button hidden';  // Initially hidden
    transcriptButton.innerHTML = '<span class="material-icons">visibility_off</span>'; // Show icon for "Show Transcript"

    // Create the transcript message (But hide it initially)
    const transcriptMessage = document.createElement('div');
    transcriptMessage.id = transcriptId;  // Assign the generated transcript ID
    transcriptMessage.className = 'transcript-message'; // Start hidden
    transcriptMessage.textContent = '';  // Initially empty

    // Append the button, audio, and transcript inside the audioContainer
    audioContainer.appendChild(transcriptButton);
    audioContainer.appendChild(audioPlayer);
    audioContainer.appendChild(transcriptMessage);

    // Add the audio container to the chat output
    chatOutput.appendChild(audioContainer);
    chatOutput.scrollTop = chatOutput.scrollHeight; // Scroll to the bottom

    // Toggle visibility of audio and transcript
    transcriptButton.onclick = () => {
        const audioElement = document.getElementById(audioPlayer.id);
        const transcriptElement = document.getElementById(transcriptMessage.id);

        if (transcriptElement.style.display === 'none' || transcriptElement.style.display === '') {
            transcriptElement.style.display = 'block'; // Show transcript
            audioElement.style.display = 'none'; // Hide audio
            transcriptButton.innerHTML = '<span class="material-icons">visibility</span>'; // Change icon to "Hide Transcript"
            transcriptButton.classList.add('transcript-visible');
        } else {
            transcriptElement.style.display = 'none'; // Hide transcript
            audioElement.style.display = 'block'; // Show audio
            transcriptButton.innerHTML = '<span class="material-icons">visibility_off</span>'; // Change icon to "Show Transcript"
            transcriptButton.classList.remove('transcript-visible');
        }
    };

    // Send the audio to the server for transcription
    sendAudioToServer(audioBlob, transcriptButton, transcriptMessage);
    displayBotListening();
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

// Function to send the transcription of user audio to the bot
function sendTranscriptionToBot(transcription) {
    if (transcription.trim() === '') return; // Ensure there's input

    // Replace the "listening" message with "typing" message
    replaceListeningWithTyping();

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
            // Remove the "typing" message and add the bot's response
            removeBotTyping();
            displayBotResponse(data.response);
        })
        .catch(error => {
            console.error('Error:', error);

            // Remove the "typing" message and show an error message
            removeBotTyping();
            displayBotResponse('Sorry, there was an error processing your request.');
        });

    // Reset input field
    document.getElementById('user-input').value = '';  // Clear input field
}

// Function to replace "listening" message with "typing"
function replaceListeningWithTyping() {
    const listeningMessage = document.getElementById('bot-listening');
    if (listeningMessage) {
        listeningMessage.textContent = 'Assistant: *typing*';  // Replace the "listening" message with "typing"
        listeningMessage.id = 'bot-typing';
    }
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
