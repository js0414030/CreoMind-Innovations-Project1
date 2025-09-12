// Popup News Modal Functionality
class PopupNewsManager {
    constructor() {
        this.modal = document.getElementById('popupNewsModal');
        this.closeBtn = document.getElementById('closePopupNews');
        this.overlay = document.querySelector('.popup-news-overlay');
        this.hasShownToday = false;
        
        this.init();
    }

    init() {
        // Check if popup should be shown
        this.checkAndShowPopup();
        
        // Event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closePopup());
        }

        // Overlay click to close
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closePopup());
        }

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.closePopup();
            }
        });

        // Prevent modal content click from closing
        const modalContent = document.querySelector('.popup-news-content');
        if (modalContent) {
            modalContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    checkAndShowPopup() {
        // Check if popup was already shown today
        const lastShown = localStorage.getItem('popupNewsLastShown');
        const today = new Date().toDateString();
        
        if (lastShown !== today) {
            // Load popup content and show
            this.loadPopupContent();
        }
    }

    async loadPopupContent() {
        try {
            // Try to load from admin panel API first
            const adminContent = await this.loadFromAdmin();
            
            if (adminContent) {
                this.populateContent(adminContent);
                this.showPopup();
            } else {
                // Fallback to default content
                this.loadDefaultContent();
            }
        } catch (error) {
            console.log('Loading default popup content');
            this.loadDefaultContent();
        }
    }

    async loadFromAdmin() {
        try {
            // This would connect to your admin panel API
            const response = await fetch('/api/popup-news/active');
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.log('Admin API not available, using default content');
        }
        return null;
    }

    loadDefaultContent() {
        // Default popup content when admin panel is not available
        const defaultContent = {
            title: "Welcome to Abhaya News!",
            description: "Stay updated with the latest breaking news, politics, technology, sports, and more. Your trusted source for reliable journalism.",
            image: "assests/logo2.png",
            link: "index.html",
            videoLink: null,
            date: new Date().toLocaleDateString()
        };

        this.populateContent(defaultContent);
        this.showPopup();
    }

    populateContent(content) {
        // Update title
        const titleElement = document.getElementById('popupNewsTitle');
        if (titleElement) {
            titleElement.textContent = content.title;
        }

        // Update description
        const descElement = document.getElementById('popupNewsDescription');
        if (descElement) {
            descElement.textContent = content.description;
        }

        // Update image
        const imageElement = document.getElementById('popupNewsImage');
        if (imageElement && content.image) {
            imageElement.src = content.image;
            imageElement.alt = content.title;
        }

        // Update read more link
        const linkElement = document.getElementById('popupNewsLink');
        if (linkElement && content.link) {
            linkElement.href = content.link;
        }

        // Update video link
        const videoElement = document.getElementById('popupVideoLink');
        if (videoElement) {
            if (content.videoLink) {
                videoElement.href = content.videoLink;
                videoElement.style.display = 'inline-flex';
            } else {
                videoElement.style.display = 'none';
            }
        }

        // Update date
        const dateElement = document.getElementById('popupNewsDate');
        if (dateElement) {
            dateElement.textContent = content.date;
        }
    }

    showPopup() {
        if (this.modal) {
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            // Show modal with animation
            this.modal.classList.add('show');
            
            // Mark as shown today
            localStorage.setItem('popupNewsLastShown', new Date().toDateString());
            this.hasShownToday = true;
        }
    }

    closePopup() {
        if (this.modal) {
            // Restore body scroll
            document.body.style.overflow = '';
            
            // Hide modal
            this.modal.classList.remove('show');
        }
    }

    // Method for admin panel to trigger popup with new content
    showWithContent(content) {
        this.populateContent(content);
        this.showPopup();
    }

    // Method to manually show popup (for testing or admin purposes)
    forceShow() {
        this.loadPopupContent();
    }
}

// Admin Panel Integration Functions
class PopupNewsAdmin {
    constructor() {
        this.apiEndpoint = '/api/admin/popup-news';
    }

    // Save popup content from admin panel
    async savePopupContent(content) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(content)
            });

            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Failed to save popup content');
            }
        } catch (error) {
            console.error('Error saving popup content:', error);
            throw error;
        }
    }

    // Get current popup content
    async getPopupContent() {
        try {
            const response = await fetch(this.apiEndpoint, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });

            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Failed to get popup content');
            }
        } catch (error) {
            console.error('Error getting popup content:', error);
            throw error;
        }
    }

    // Delete popup content
    async deletePopupContent() {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });

            if (response.ok) {
                return true;
            } else {
                throw new Error('Failed to delete popup content');
            }
        } catch (error) {
            console.error('Error deleting popup content:', error);
            throw error;
        }
    }

    // Upload image for popup
    async uploadImage(file) {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/admin/upload-popup-image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                return result.imageUrl;
            } else {
                throw new Error('Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    getAuthToken() {
        // Get auth token from localStorage or sessionStorage
        return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    }
}

// Initialize popup news when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on home page
    if (window.location.pathname === '/' || window.location.pathname === '/index.html' || window.location.pathname.endsWith('index.html')) {
        window.popupNewsManager = new PopupNewsManager();
        window.popupNewsAdmin = new PopupNewsAdmin();
    }
});

// Export for use in other modules
export { PopupNewsManager, PopupNewsAdmin };
