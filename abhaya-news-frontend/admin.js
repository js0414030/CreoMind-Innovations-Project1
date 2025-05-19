// API Base URL - Use relative path for proxy to work
const API_BASE_URL = '/api';

// DOM Elements
const uploadForm = document.getElementById('uploadForm');
const logoutBtn = document.getElementById('logoutBtn');

// Check Authentication
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        // Redirect to login page if not authenticated
        window.location.href = 'index.html';
        return;
    }
    
    // Add success and error message containers
    const adminPanel = document.querySelector('.admin-panel');
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.id = 'successMessage';
    successMessage.textContent = 'News uploaded successfully!';
    
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.id = 'errorMessage';
    errorMessage.textContent = 'An error occurred while uploading news.';
    
    adminPanel.insertBefore(successMessage, adminPanel.firstChild);
    adminPanel.insertBefore(errorMessage, adminPanel.firstChild);
});

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});

// Upload News
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to upload news');
        window.location.href = 'index.html';
        return;
    }
    
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const body = document.getElementById('body').value;
    const imageFile = document.getElementById('image').files[0];
    
    // Create FormData object
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('body', body);
    
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    // Show loading state
    const submitButton = uploadForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Uploading...';
    submitButton.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/news/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || `HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Show success message
        const successMessage = document.getElementById('successMessage');
        successMessage.textContent = 'News uploaded successfully!';
        successMessage.style.display = 'block';
        
        // Hide after 3 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
        
        // Reset form
        uploadForm.reset();
    } catch (error) {
        console.error('Upload error:', error);
        
        // Show error message
        const errorMessage = document.getElementById('errorMessage');
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage.textContent = 'Cannot connect to the server. Please make sure the backend is running.';
        } else {
            errorMessage.textContent = `Error: ${error.message}`;
        }
        
        errorMessage.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    } finally {
        // Reset button state
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
});