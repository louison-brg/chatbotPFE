// Fonctions pour afficher le chatbot en cliquant sur le bouton
document.addEventListener("DOMContentLoaded", () => {
    const startChatButton = document.getElementById("start-button");
    const chatContainer = document.getElementById("chat-container");
    startChatButton.addEventListener("click", () => {
        chatContainer.style.height = "60%"; // Aggrandi la hauteur de 0 à 60%
        chatContainer.style.opacity = 1; // Afficher le chatbot
        startChatButton.style.display = "none"; // Cache le bouton
    });
});
