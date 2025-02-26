// Function to handle option 1 (Choose Q&A for the Bot)
function handleChooseQA() {
    // Create the upload container dynamically
    const uploadContainer = document.createElement('div');
    uploadContainer.classList.add('upload-container');
    uploadContainer.id = 'upload-container';

    // Create the file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json'; // Only accept .json files
    fileInput.style.display = 'none'; // Hide file input element

    // Create the status message element
    const statusMessage = document.createElement('p');
    statusMessage.id = 'statusUpload';
    statusMessage.style.fontWeight = 'bold';

    // Append the file input and status message to the container
    uploadContainer.appendChild(fileInput);
    uploadContainer.appendChild(statusMessage);

    // Append the upload container to the body (or another container you choose)
    document.body.appendChild(uploadContainer);

    // Trigger the hidden file input click
    fileInput.click();

    // Remove the old chat container if it exists
    const oldChatContainer = document.getElementById("chat-container");
    if (oldChatContainer) {
        oldChatContainer.style.transition = 'height 0.8s ease, opacity 0.8s ease'; // Same transition as opening
        oldChatContainer.style.height = '0';  // Collapse height to 0
        oldChatContainer.style.opacity = '0'; // Fade out

        // Wait for the animation to finish before removing the element
        setTimeout(() => {
            oldChatContainer.remove(); // Remove the chat container after the animation
        }, 800); // Delay corresponds to the animation duration (0.8s for height and 0.5s for opacity)
    }
    
    const startChatButton = document.getElementById("start-button");
    if (!startChatButton.classList.contains("hidden")) {
        // If it has the hidden class, remove it and set display to flex
        startChatButton.classList.add("hidden");
        startChatButton.style.display = "flex";
    } 
    // Handle file input change
    fileInput.addEventListener('change', async () => {
        if (fileInput.files.length === 0) {
            // No file selected
            statusMessage.textContent = 'No file selected';
            return;
        }

        const file = fileInput.files[0];
        console.log("Selected file:", file.name);

        const formData = new FormData();
        formData.append("file", file);

        // Show status message indicating upload is in progress
        statusMessage.textContent = 'Uploading ' + file.name + '...';

        try {
            const response = await fetch('/upload-file', { // Endpoint to handle the file
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            console.log("Server Response:", result);

            // This function will be called once the file upload is successful
            if (response.ok) {
                // Upload successful
                statusMessage.style.color = 'green';
                statusMessage.textContent = '' + file.name + ' uploaded successfully!';

                startChatButton.classList.remove("hidden");

            } else {
                // Handle non-200 HTTP responses
                statusMessage.style.color = 'red';
                statusMessage.textContent = 'Failed to upload file: ' + result.message || 'Unknown error';
            }
        } catch (error) {
            console.error('Error during file upload:', error);
            // Provide more specific feedback in the status message
            statusMessage.style.color = 'red';
            statusMessage.textContent = 'Error during upload: ' + (error.message || 'Unknown error');
        }

        // Hide the message after 3 seconds
        setTimeout(() => {
            statusMessage.textContent = '';
        }, 3000);
    });
}
