// Fonctions pour afficher le chatbot en cliquant sur le bouton
document.addEventListener("DOMContentLoaded", () => {
    const startChatButton = document.getElementById("start-button");

    startChatButton.addEventListener("click", () => {
        initiateChat();
    });
});
