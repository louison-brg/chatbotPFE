document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("fileInput");

    fileInput.addEventListener("change", async () => {
        if (fileInput.files.length === 0) {
            console.log("No file selected.");
            return;
        }

        const file = fileInput.files[0];
        console.log("Selected file:", file.name);

        const formData = new FormData();
        formData.append("file", file);

        document.getElementById("status").textContent = "Uploading...";

        try {
            const response = await fetch("http://127.0.0.1:5000/upload", {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            console.log("Server Response:", result);

            if (response.ok) {
                document.getElementById("status").textContent = "Upload successful!";
            } else {
                document.getElementById("status").textContent = "Error: " + result.message;
            }
        } catch (error) {
            console.error("Upload failed:", error);
            document.getElementById("status").textContent = "Upload failed. Check console.";
        }
    });
});
