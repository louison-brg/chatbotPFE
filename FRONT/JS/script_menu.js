// Toggle the menu and options
function toggleMenu() {
    const container = document.querySelector('.container');
    container.classList.toggle('change'); // Toggle the transform of the hamburger

    // Toggle the menu options visibility
    const menuOptions = document.getElementById('menu-options');
    if (container.classList.contains('change')) {
        menuOptions.style.display = 'block'; // Show options
    } else {
        menuOptions.style.display = 'none'; // Hide options
    }
}

// Handle option selection
document.getElementById('option1').addEventListener('click', function() {
    handleChooseQA();
    toggleMenu();
});

// Upload
document.getElementById('option2').addEventListener('click', function() {
    initializeFileUpload();
    toggleMenu();
});
