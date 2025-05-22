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

        // If this is the navbar, set up the login button, scroll effects, and mobile menu
        if (elementId === 'navbar') {
            setupLoginButton();
            setupScrollEffects();
            setupMobileMenu();
        }
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

// Function to set up the login button functionality
function setupLoginButton() {
    const loginBtn = document.getElementById('loginBtn');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');

    // Set up both desktop and mobile login buttons
    [loginBtn, mobileLoginBtn].forEach(btn => {
        if (!btn) return;
        setupSingleLoginButton(btn);
    });
}

// Function to set up a single login button
function setupSingleLoginButton(loginBtn) {
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

// Function to set up scroll effects for the navbar
function setupScrollEffects() {
    const header = document.querySelector('header');
    if (!header) return;

    let lastScrollTop = 0;
    let ticking = false;

    function updateNavbar() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Add scrolled class when scrolled down more than 50px
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScrollTop = scrollTop;
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }

    // Throttled scroll event listener for better performance
    window.addEventListener('scroll', requestTick, { passive: true });

    // Initial check
    updateNavbar();
}

// Function to set up mobile menu functionality
function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navbarNav = document.getElementById('navbarNav');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const navLinks = document.querySelectorAll('.nav-main a');

    if (!mobileMenuToggle || !navbarNav || !mobileMenuOverlay) return;

    // Toggle mobile menu
    function toggleMobileMenu() {
        const isActive = navbarNav.classList.contains('active');

        if (isActive) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    // Open mobile menu
    function openMobileMenu() {
        navbarNav.classList.add('active');
        mobileMenuToggle.classList.add('active');
        mobileMenuOverlay.classList.add('active');
        document.body.classList.add('menu-open');

        // Add escape key listener
        document.addEventListener('keydown', handleEscapeKey);
    }

    // Close mobile menu
    function closeMobileMenu() {
        navbarNav.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.classList.remove('menu-open');

        // Remove escape key listener
        document.removeEventListener('keydown', handleEscapeKey);
    }

    // Handle escape key
    function handleEscapeKey(event) {
        if (event.key === 'Escape') {
            closeMobileMenu();
        }
    }

    // Handle window resize
    function handleResize() {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    }

    // Event listeners
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);

    // Close menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Add small delay to allow navigation to start
            setTimeout(closeMobileMenu, 100);
        });
    });

    // Handle window resize
    window.addEventListener('resize', handleResize);

    // Handle touch events for better mobile experience
    let touchStartY = 0;
    let touchEndY = 0;

    navbarNav.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    });

    navbarNav.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = touchStartY - touchEndY;

        // Swipe up to close menu (only if menu is at top)
        if (swipeDistance > swipeThreshold && navbarNav.scrollTop === 0) {
            closeMobileMenu();
        }
    }
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
    const navLinks = document.querySelectorAll('.nav-main a');
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
