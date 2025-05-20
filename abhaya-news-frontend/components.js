// Function to load HTML components
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Failed to load component: ${response.status}`);
        }
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;

        // Set active class for current page in navbar
        setActiveNavLink();

        // If this is the navbar, set up the login button
        if (elementId === 'navbar') {
            setupLoginButton();
        }
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

// Function to set up the login button functionality
function setupLoginButton() {
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;

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
            // Check if we're on the index page and have a login modal
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                // Show login modal
                loginModal.style.display = 'block';

                // Set up modal close button
                const closeBtn = loginModal.querySelector('.close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        loginModal.style.display = 'none';
                    });
                }

                // Close modal when clicking outside
                window.addEventListener('click', (e) => {
                    if (e.target === loginModal) {
                        loginModal.style.display = 'none';
                    }
                });

                // Set up login form
                const loginForm = document.getElementById('loginForm');
                if (loginForm) {
                    loginForm.addEventListener('submit', async (e) => {
                        e.preventDefault();

                        const email = document.getElementById('email').value;
                        const password = document.getElementById('password').value;

                        try {
                            // Simulate successful login (in a real app, this would call an API)
                            // For demo purposes, we'll accept any email/password
                            const token = 'demo-token-' + Date.now();
                            localStorage.setItem('token', token);
                            loginBtn.textContent = 'Logout';
                            loginModal.style.display = 'none';
                            alert('Logged in successfully');

                            // Redirect to admin page
                            window.location.href = 'admin.html';
                        } catch (error) {
                            console.error('Login error:', error);
                            alert('An error occurred during login');
                        }
                    });
                }
            } else {
                // Redirect to admin page if no modal is available
                window.location.href = 'admin.html';
            }
        }
    });
}

// Function to set the active class on the current page's navigation link
function setActiveNavLink() {
    // Get the current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Map of page filenames to their corresponding nav IDs
    const pageToNavId = {
        'index.html': 'nav-home',
        'politics.html': 'nav-politics',
        'technology.html': 'nav-technology',
        'sports.html': 'nav-sports',
        'entertainment.html': 'nav-entertainment',
        'admin.html': 'nav-home' // Admin page highlights home
    };

    // Remove all active classes first
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => link.classList.remove('active'));

    // Add active class to the current page's nav link
    const activeNavId = pageToNavId[currentPage];
    if (activeNavId) {
        const activeLink = document.getElementById(activeNavId);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
}

// Load components when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the admin page
    const isAdminPage = window.location.pathname.includes('admin.html');

    // Load navbar if it exists on the page
    const navbarElement = document.getElementById('navbar');
    if (navbarElement) {
        loadComponent('navbar', 'components/navbar.html');
    }

    // Load the appropriate footer
    if (isAdminPage) {
        loadComponent('footer', 'components/admin-footer.html');
    } else {
        loadComponent('footer', 'components/footer.html');
    }
});
