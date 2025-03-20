let previousStatusUpload = '';  // Store the previous status to detect changes
let statusTimeoutUpload = null;  // Timeout reference for clearing the status message

// Function to create the file input and handle the upload for general files (e.g., .txt, .pdf)
function initializeFileUpload() {
    // Create the upload container dynamically
    const uploadContainerUpload = document.createElement('div');
    uploadContainerUpload.classList.add('upload-container');
    uploadContainerUpload.id = 'upload-containerUpload';

    // Create the file input element
    const fileInputUpload = document.createElement('input');
    fileInputUpload.type = 'file';
    fileInputUpload.id = 'fileUploadUpload';
    fileInputUpload.accept = '.txt,.pdf';  // Accept .txt and .pdf files

    // Create the status message element
    const statusMessageUpload = document.createElement('p');
    statusMessageUpload.id = 'statusMessageUpload';  // Ensure the ID matches for status updates
    statusMessageUpload.style.fontWeight = 'bold'; // Matching style

    // Append the file input and status message to the container
    uploadContainerUpload.appendChild(fileInputUpload);
    uploadContainerUpload.appendChild(statusMessageUpload);

    // Append the upload container to the body
    document.body.appendChild(uploadContainerUpload);

    // Trigger the hidden file input click
    fileInputUpload.click();

    // Log file input triggered
    console.log("File input triggered");

    // Handle file input change
    fileInputUpload.addEventListener('change', async () => {
        if (fileInputUpload.files.length === 0) {
            // No file selected
            return;
        }

        const file = fileInputUpload.files[0];
        console.log("Selected file:", file.name);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://127.0.0.1:5000/upload/", {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            console.log("Server Response:", result);

        } catch (error) {
            console.error("Upload failed:", error);
        }
    });
}

// Function to fetch status updates for the upload section
async function fetchStatusUpdatesUpload() {
    const statusMessageUpload = document.getElementById('statusMessageUpload');  // Correct ID to match the element
    
    try {
        // Fetch the current status from the backend
        const response = await fetch('http://127.0.0.1:5000/get_status');
        
        // Check if the response is ok (status code 200)
        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                // If the status has changed, update the status message
                if (data.status !== previousStatusUpload) {
                    // Clear the existing timeout if the status has changed
                    if (statusTimeoutUpload) {
                        clearTimeout(statusTimeoutUpload);
                    }

                    // Update the displayed status
                    statusMessageUpload.textContent = data.status;

                    // Reset the timeout to hide the message after 5 seconds
                    statusTimeoutUpload = setTimeout(() => {
                        statusMessageUpload.textContent = '';
                    }, 5000);  // Hide the message after 5 seconds of inactivity

                    // Store the new status
                    previousStatusUpload = data.status;
                }
            }
        } else {
            console.error("Error fetching status from the server.");
        }
    } catch (error) {
        console.error("Error during status fetch:", error);
    }
}

// Start polling for status updates every second for the upload section
setInterval(fetchStatusUpdatesUpload, 1000);  // Poll every 1 second
