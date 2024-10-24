// Function to send the message to the chatbot API
function sendMessage() {
    let userInput = document.getElementById('user-input').value;
    if (userInput.trim() === '') return; // Ensure there's input

    // Display user message
    let chatOutput = document.getElementById('chat-output');
    let userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.textContent = 'Vous : ' + userInput;
    chatOutput.appendChild(userMessage);

    // Send message to Flask server at the /chat endpoint
    fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Specify JSON content type
        },
        body: JSON.stringify({ message: userInput })  // Send user input as JSON
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok'); // Check for response errors
        }
        return response.json();  // Parse the JSON from the response
    })
    .then(data => {
        // Display bot response
        let botMessage = document.createElement('div');
        botMessage.className = 'bot-message';
        botMessage.textContent = 'Chat_V1 : ' + data.response;  // Display response from server
        chatOutput.appendChild(botMessage);
        chatOutput.scrollTop = chatOutput.scrollHeight;  // Scroll to the bottom of chat output
    })
    .catch(error => {
        console.error('Erreur:', error); // Log any errors to console
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
