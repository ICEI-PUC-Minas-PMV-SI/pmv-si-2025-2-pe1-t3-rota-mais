document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.filter-tab');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            buttons.forEach(b => b.classList.remove('active'));
            button.classList.add('active');
        });
    });
});