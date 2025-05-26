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
    const adminPanelBtn = document.getElementById('adminPanelBtn');
    if (!loginBtn) return;

    const token = localStorage.getItem('token');

    // Check if user is logged in
    if (token) {
        loginBtn.textContent = 'Logout';
        if (adminPanelBtn) {
            adminPanelBtn.style.display = 'inline-block';
        }
    }

    // Admin Panel Button Functionality
    if (adminPanelBtn) {
        adminPanelBtn.addEventListener('click', () => {
            window.location.href = 'admin.html';
        });
    }

    // Login Button Functionality
    loginBtn.addEventListener('click', () => {
        if (token) {
            // Logout
            localStorage.removeItem('token');
            loginBtn.textContent = 'Admin Login';
            if (adminPanelBtn) {
                adminPanelBtn.style.display = 'none';
            }
            showSuccessToast('Logged out successfully');
            // Reload the page to update UI after a short delay to show the toast
            setTimeout(() => {
                window.location.reload();
            }, 1000);
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
                        const submitButton = loginForm.querySelector('button[type="submit"]');
                        const originalButtonText = submitButton.textContent;

                        // Validate inputs
                        if (!email || !password) {
                            showErrorToast('Please fill in all fields');
                            return;
                        }

                        // Show loading state
                        submitButton.disabled = true;
                        submitButton.classList.add('loading');
                        submitButton.textContent = 'Signing In...';

                        try {
                            // Call the actual backend API for login
                            const response = await fetch('/api/admin/login', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ email, password })
                            });

                            if (!response.ok) {
                                const data = await response.json();
                                throw new Error(data.message || `HTTP error! Status: ${response.status}`);
                            }

                            const data = await response.json();

                            // Store the real JWT token from the backend
                            localStorage.setItem('token', data.token);
                            loginBtn.textContent = 'Logout';
                            if (adminPanelBtn) {
                                adminPanelBtn.style.display = 'inline-block';
                            }

                            // Clear form
                            loginForm.reset();
                            loginModal.style.display = 'none';
                            showSuccessToast('Welcome back! Redirecting to admin panel...');

                            // Redirect to admin page after a short delay to show the toast
                            setTimeout(() => {
                                window.location.href = 'admin.html';
                            }, 1500);
                        } catch (error) {
                            console.error('Login error:', error);
                            let errorMessage = 'Login failed. Please try again.';

                            if (error.message.includes('Invalid credentials')) {
                                errorMessage = 'Invalid email or password. Please check your credentials.';
                            } else if (error.message.includes('Failed to fetch')) {
                                errorMessage = 'Unable to connect to server. Please check your connection.';
                            } else if (error.message) {
                                errorMessage = error.message;
                            }

                            showErrorToast(errorMessage);
                        } finally {
                            // Reset button state
                            submitButton.disabled = false;
                            submitButton.classList.remove('loading');
                            submitButton.textContent = originalButtonText;
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
        'business.html': 'nav-business',
        'health.html': 'nav-health',
        'science.html': 'nav-science',
        'world.html': 'nav-world',
        'lifestyle.html': 'nav-lifestyle',
        'education.html': 'nav-education',
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

// Function to set up dropdown navigation
function setupDropdownNavigation() {
    const dropdown = document.querySelector('.dropdown');
    const dropdownToggle = document.querySelector('.dropdown-toggle');

    if (dropdown && dropdownToggle) {
        // Handle click on dropdown toggle for mobile
        dropdownToggle.addEventListener('click', (e) => {
            e.preventDefault();
            dropdown.classList.toggle('dropdown-active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('dropdown-active');
            }
        });
    }
}

// Load components when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the admin page
    const isAdminPage = window.location.pathname.includes('admin.html');

    // Load navbar if it exists on the page
    const navbarElement = document.getElementById('navbar');
    if (navbarElement) {
        loadComponent('navbar', 'components/navbar.html').then(() => {
            setupDropdownNavigation();
        });
    }

    // Load the appropriate footer
    if (isAdminPage) {
        loadComponent('footer', 'components/admin-footer.html');
    } else {
        loadComponent('footer', 'components/footer.html');
    }
});
