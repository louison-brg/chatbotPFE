// Function to create the file input and handle the upload
function initializeFileUpload() {
    // Create the upload container dynamically
    const uploadContainer = document.createElement('div');
    uploadContainer.classList.add('upload-container');
    uploadContainer.id = 'upload-container';

    // Create the file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'fileUpload';
    fileInput.accept = '.txt,.pdf';

    // Create the status message element
    const statusMessage = document.createElement('p');
    statusMessage.id = 'statusUpload';
    statusMessage.style.fontWeight = 'bold'; // Matching style

    // Append the file input and status message to the container
    uploadContainer.appendChild(fileInput);
    uploadContainer.appendChild(statusMessage);

    // Append the upload container to the body
    document.body.appendChild(uploadContainer);

    // Trigger the hidden file input click
    fileInput.click();

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
        statusMessage.textContent = 'Uploading...';

        try {
            const response = await fetch("http://127.0.0.1:5000/upload", {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            console.log("Server Response:", result);

            if (response.ok) {
                // Upload successful
                statusMessage.style.color = 'green';
                statusMessage.textContent = file.name + ' uploaded successfully!';
            } else {
                // Handle non-200 HTTP responses
                statusMessage.style.color = 'red';
                statusMessage.textContent = 'Error: ' + result.message || 'Unknown error';
            }
        } catch (error) {
            console.error("Upload failed:", error);
            statusMessage.style.color = 'red';
            statusMessage.textContent = 'Upload failed. Check console.';
        }

        // Hide the status message after 3 seconds
        setTimeout(() => {
            statusMessage.textContent = '';
        }, 3000); // Hide after 3 seconds
    });
}
