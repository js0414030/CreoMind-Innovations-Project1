// This file handles functionality specific to category pages

document.addEventListener('DOMContentLoaded', function() {
    // Get the current page category from the active navigation link
    const activeNavLink = document.querySelector('nav ul li a.active');
    const currentCategory = activeNavLink ? activeNavLink.textContent.toLowerCase() : null;

    // Skip processing if we're on the home page
    if (currentCategory === 'home' || !currentCategory) {
        return; // Exit early, let the home page handle its own functionality
    }

    console.log('Current category page:', currentCategory);

    // DOM Elements
    const loginBtn = document.getElementById('loginBtn');
    const token = localStorage.getItem('token');

    // Check if user is logged in
    if (token) {
        loginBtn.textContent = 'Logout';
    }

    // Login Button Functionality
    loginBtn.addEventListener('click', () => {
        if (token) {
            // Logout
            localStorage.removeItem('token');
            loginBtn.textContent = 'Admin Login';
            alert('Logged out successfully');
            // Reload the page to update UI
            window.location.reload();
        } else {
            // Redirect to home page for login
            window.location.href = 'index.html';
        }
    });

    // Make trending cards clickable
    const trendingCards = document.querySelectorAll('.trending-card');
    trendingCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('h3').textContent;
            alert(`${currentCategory.toUpperCase()} NEWS: ${title}\n\nThis would open the full article in a real application.`);
        });
    });

    // Make news cards clickable
    const newsCards = document.querySelectorAll('.news-card');
    newsCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('h3').textContent;
            alert(`${currentCategory.toUpperCase()} NEWS: ${title}\n\nThis would open the full article in a real application.`);
        });
    });

    // Make category cards clickable
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('h3').textContent;
            alert(`${currentCategory.toUpperCase()} NEWS: ${title}\n\nThis would open the full article in a real application.`);
        });
    });

    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value;

            // Simple validation
            if (email) {
                alert(`Thank you for subscribing to our ${currentCategory} newsletter with ${email}! You'll receive updates soon.`);
                emailInput.value = '';
            }
        });
    }
});
