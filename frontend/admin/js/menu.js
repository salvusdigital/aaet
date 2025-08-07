document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    // Create menu toggle button if it doesn't exist
    if (!menuToggle && sidebar) {
        const newMenuToggle = document.createElement('button');
        newMenuToggle.className = 'menu-toggle';
        newMenuToggle.innerHTML = '☰';
        document.body.prepend(newMenuToggle);
        
        newMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInside = sidebar.contains(event.target) || newMenuToggle.contains(event.target);
            if (!isClickInside && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    } else if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInside = sidebar.contains(event.target) || menuToggle.contains(event.target);
            if (!isClickInside && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    }
    
    // Close sidebar when clicking on a nav link on mobile
    const navLinks = document.querySelectorAll('.nav-links li');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 992) {
                sidebar.classList.remove('open');
            }
        });
    });
});
