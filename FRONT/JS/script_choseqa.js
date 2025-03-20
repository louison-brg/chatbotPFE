let previousStatusQA = '';  // Store the previous status to detect changes
let statusTimeoutQA = null;  // Timeout reference for clearing the status message

// Function to handle option 1 (Choose Q&A for the Bot)
function handleChooseQA() {
    // Create the upload container dynamically
    const uploadContainerQA = document.createElement('div');
    uploadContainerQA.classList.add('upload-container');
    uploadContainerQA.id = 'upload-containerQA';

    // Create the file input element
    const fileInputQA = document.createElement('input');
    fileInputQA.type = 'file';
    fileInputQA.id = 'fileUploadQA';
    fileInputQA.accept = '.json';  // Only accept .json files

    // Create the status message element
    const statusMessageQA = document.createElement('p');
    statusMessageQA.id = 'statusUploadQA';  // Ensure this ID matches the one used in fetchStatusUpdatesQA
    statusMessageQA.style.fontWeight = 'bold';

    // Append the file input and status message to the container
    uploadContainerQA.appendChild(fileInputQA);
    uploadContainerQA.appendChild(statusMessageQA);

    // Append the upload container to the body (or another container you choose)
    document.body.appendChild(uploadContainerQA);

    // Trigger the hidden file input click
    fileInputQA.click();

    // Remove the old chat container if it exists
    const oldChatContainer = document.getElementById("chat-container");
    if (oldChatContainer) {
        closeChat();
        // Wait for the animation to finish before removing the element
        setTimeout(() => {
            document.body.removeChild(oldChatContainer);  // Remove chat container after animation
        }, 500);  // Matches the animation time
    }

    const startChatButton = document.getElementById("start-button");
    if (!startChatButton.classList.contains("hidden")) {
        // If it has the hidden class, remove it and set display to flex
        startChatButton.classList.add("hidden");
        startChatButton.style.display = "flex";
    }

    // Handle file input change
    fileInputQA.addEventListener('change', async () => {
        if (fileInputQA.files.length === 0) {
            // No file selected
            return;
        }

        const file = fileInputQA.files[0];
        console.log("Selected file:", file.name);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch('/upload-file', { // Endpoint to handle the file
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            console.log("Server Response:", result);

            // This function will be called once the file upload is successful
            if (response.ok) {
                startChatButton.classList.remove("hidden");
            } else {
                console.error("Error in file upload.");
            }
        } catch (error) {
            console.error('Error during file upload:', error);
        }
    });
}

// Function to fetch status updates and display them
async function fetchStatusUpdatesQA() {
    const statusMessageQA = document.getElementById('statusUploadQA');  // Corrected ID to match handleChooseQA
    
    try {
        // Fetch the current status from the backend
        const response = await fetch('http://127.0.0.1:5000/get_status');
        
        // Check if the response is ok (status code 200)
        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                // If the status has changed, update the status message
                if (data.status !== previousStatusQA) {
                    // Clear the existing timeout if the status has changed
                    if (statusTimeoutQA) {
                        clearTimeout(statusTimeoutQA);
                    }

                    // Update the displayed status
                    statusMessageQA.textContent = data.status;

                    // Reset the timeout to hide the message after 5 seconds
                    statusTimeoutQA = setTimeout(() => {
                        statusMessageQA.textContent = '';
                    }, 5000);  // Hide the message after 5 seconds of inactivity

                    // Store the new status
                    previousStatusQA = data.status;
                }
            }
        } else {
            console.error("Error fetching status from the server.");
        }
    } catch (error) {
        console.error("Error during status fetch:", error);
    }
}

// Start polling for status updates every second
setInterval(fetchStatusUpdatesQA, 1000);  // Poll every 1 second
