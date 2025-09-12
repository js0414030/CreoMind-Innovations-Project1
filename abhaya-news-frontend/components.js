import API_BASE_URL from './config.js';
import { showSuccessToast, showErrorToast } from './toast.js';

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

        // If this is the navbar, set up extra features
        if (elementId === 'navbar') {
            setupDropdownNavigation();
            setupDateTime();
            setupLoginButton();
            setupMobileMenu();
        }
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

// ✅ Setup login/logout/Admin injection
function setupLoginButton() {
    const desktopMore = document.getElementById("desktopMore");
    const mobileAdmin = document.getElementById("mobileAdmin");
    if (!desktopMore || !mobileAdmin) return;

    const token = localStorage.getItem("token");

    // Reset existing entries
    const existingAdminLinks = desktopMore.querySelectorAll(".admin-link");
    existingAdminLinks.forEach(el => el.remove());
    mobileAdmin.innerHTML = "";

    if (token) {
        // Logged in → Admin Panel + Logout
        desktopMore.innerHTML += `
            <a href="admin.html" id="adminPanelBtn" class="admin-link">Admin Panel</a>
            <a href="#" id="logoutBtn" class="admin-link">Logout</a>
        `;
        mobileAdmin.innerHTML = `
            <a href="admin.html" class="admin-link">Admin Panel</a>
            <a href="#" id="logoutBtnMobile" class="admin-link">Logout</a>
        `;
    } else {
        // Logged out → Admin Login
        desktopMore.innerHTML += `<a href="#" id="loginBtn" class="admin-link">Admin Login</a>`;
        mobileAdmin.innerHTML = `<a href="#" id="loginBtnMobile" class="admin-link">Admin Login</a>`;
    }

    // Attach listeners to both desktop and mobile buttons
    const loginBtnDesktop = document.getElementById("loginBtn");
    const loginBtnMobile = document.getElementById("loginBtnMobile");
    const logoutBtnDesktop = document.getElementById("logoutBtn");
    const logoutBtnMobile = document.getElementById("logoutBtnMobile");
    const adminPanelBtn = document.getElementById("adminPanelBtn");

    if (adminPanelBtn) {
        adminPanelBtn.addEventListener("click", () => {
            window.location.href = "admin.html";
        });
    }

    // Logout button handlers
    [logoutBtnDesktop, logoutBtnMobile].forEach(btn => {
        if (btn) {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("token");
                showSuccessToast("Logged out successfully");
                setTimeout(() => window.location.reload(), 1000);
            });
        }
    });

    // Login button handlers
    [loginBtnDesktop, loginBtnMobile].forEach(btn => {
        if (btn) {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const loginModal = document.getElementById("loginModal");
            if (loginModal) {
                loginModal.style.display = "block";
                const closeBtn = loginModal.querySelector(".close");
                if (closeBtn) {
                    closeBtn.addEventListener("click", () => {
                        loginModal.style.display = "none";
                    });
                }
                window.addEventListener("click", (e) => {
                    if (e.target === loginModal) {
                        loginModal.style.display = "none";
                    }
                });

                const loginForm = document.getElementById("loginForm");
                if (loginForm) {
                    loginForm.addEventListener("submit", async (e) => {
                        e.preventDefault();
                        const email = document.getElementById("email").value;
                        const password = document.getElementById("password").value;
                        const submitButton = loginForm.querySelector('button[type="submit"]');
                        const originalButtonText = submitButton.textContent;

                        if (!email || !password) {
                            showErrorToast("Please fill in all fields");
                            return;
                        }

                        submitButton.disabled = true;
                        submitButton.classList.add("loading");
                        submitButton.textContent = "Signing In...";

                        try {
                            const response = await fetch(`${API_BASE_URL}/admin/login`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email, password })
                            });

                            if (!response.ok) {
                                const data = await response.json();
                                throw new Error(data.message || `HTTP error! Status: ${response.status}`);
                            }

                            const data = await response.json();
                            localStorage.setItem("token", data.token);

                            loginForm.reset();
                            loginModal.style.display = "none";
                            showSuccessToast("Welcome back! Redirecting to admin panel...");

                            setTimeout(() => {
                                window.location.href = "admin.html";
                            }, 1500);
                        } catch (error) {
                            console.error("Login error:", error);
                            let errorMessage = "Login failed. Please try again.";
                            if (error.message.includes("Invalid credentials")) {
                                errorMessage = "Invalid email or password. Please check your credentials.";
                            } else if (error.message.includes("Failed to fetch")) {
                                errorMessage = "Unable to connect to server. Please check your connection.";
                            } else if (error.message) {
                                errorMessage = error.message;
                            }
                            showErrorToast(errorMessage);
                        } finally {
                            submitButton.disabled = false;
                            submitButton.classList.remove("loading");
                            submitButton.textContent = originalButtonText;
                        }
                    });
                }
            } else {
                window.location.href = "admin.html";
            }
            });
        }
    });
}

// ✅ Date + time updater
function setupDateTime() {
    const dateTimeEl = document.getElementById("dateTime");
    if (!dateTimeEl) return;

    function update() {
        const now = new Date();
        dateTimeEl.textContent = now.toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }
    update();
    setInterval(update, 60000); // refresh every 1 min
}

// Function to set the active class on the current page's navigation link
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

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
        'admin.html': 'nav-home'
    };

    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => link.classList.remove('active'));

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
        dropdownToggle.addEventListener('click', (e) => {
            e.preventDefault();
            dropdown.classList.toggle('dropdown-active');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('dropdown-active');
            }
        });
    }
}

// ✅ Mobile menu setup
function setupMobileMenu() {
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobileMenu");
    const closeMenu = document.getElementById("closeMenu");

    if (hamburger && mobileMenu && closeMenu) {
        hamburger.addEventListener("click", () => {
            mobileMenu.classList.add("active");
        });
        closeMenu.addEventListener("click", () => {
            mobileMenu.classList.remove("active");
        });
        document.addEventListener("click", (e) => {
            if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
                mobileMenu.classList.remove("active");
            }
        });
    }
}

// Load components when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    const isAdminPage = window.location.pathname.includes('admin.html');
    const navbarElement = document.getElementById('navbar');

    if (navbarElement) {
        loadComponent('navbar', 'components/navbar.html');
    }

    if (isAdminPage) {
        loadComponent('footer', 'components/admin-footer.html');
    } else {
        loadComponent('footer', 'components/footer.html');
    }
});
