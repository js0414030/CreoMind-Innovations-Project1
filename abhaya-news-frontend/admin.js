// API Base URL - Use relative path for proxy to work
const API_BASE_URL = '/api';

// DOM Elements
const uploadForm = document.getElementById('uploadForm');
const logoutBtn = document.getElementById('logoutBtn');
const newsTableBody = document.getElementById('newsTableBody');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageInfo = document.getElementById('pageInfo');
const editNewsModal = document.getElementById('editNewsModal');
const editNewsForm = document.getElementById('editNewsForm');
const closeEditModal = document.getElementById('closeEditModal');

// Pagination state
let currentPage = 1;
let totalPages = 1;
const limit = 10;

// Check Authentication
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    if (!token) {
        // Redirect to login page if not authenticated
        window.location.href = 'index.html?status=needlogin';
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

    // Load news table
    loadNewsTable(currentPage);

    // Set up pagination event listeners
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            loadNewsTable(currentPage - 1);
        }
    });

    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            loadNewsTable(currentPage + 1);
        }
    });

    // Set up modal close event
    closeEditModal.addEventListener('click', () => {
        editNewsModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editNewsModal) {
            editNewsModal.style.display = 'none';
        }
    });

    // Set up edit form submission
    editNewsForm.addEventListener('submit', handleEditNewsSubmit);
});

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    // Redirect to homepage with a logout parameter
    window.location.href = 'index.html?status=loggedout';
});

// Upload News
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        showErrorToast('You must be logged in to upload news');
        setTimeout(() => {
            window.location.href = 'index.html?status=needlogin';
        }, 1000);
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

        // Show success message with toast
        showSuccessToast('News uploaded successfully!');

        // Reset form
        uploadForm.reset();
    } catch (error) {
        console.error('Upload error:', error);

        // Show error message with toast
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            showErrorToast('Cannot connect to the server. Please make sure the backend is running.');
        } else {
            showErrorToast(`Error: ${error.message}`);
        }
    } finally {
        // Reset button state
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;

        // Reload news table to show the new entry
        loadNewsTable(currentPage);
    }
});

// Load News Table
async function loadNewsTable(page) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html?status=needlogin';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/news?page=${page}&limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Update pagination state
        currentPage = data.currentPage || 1;
        totalPages = data.totalPages || 1;

        // Update pagination UI
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;

        // Clear table
        newsTableBody.innerHTML = '';

        // Add news items to table
        if (data.news && data.news.length > 0) {
            data.news.forEach(news => {
                const row = document.createElement('tr');

                // Format date
                const date = new Date(news.createdAt).toLocaleDateString();

                row.innerHTML = `
                    <td>${news.title}</td>
                    <td>${news.category}</td>
                    <td>${date}</td>
                    <td class="action-buttons">
                        <button class="edit-btn" data-id="${news._id}">Edit</button>
                        <button class="delete-btn" data-id="${news._id}">Delete</button>
                    </td>
                `;

                newsTableBody.appendChild(row);
            });

            // Add event listeners to buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', () => openEditModal(btn.dataset.id));
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => handleDeleteNews(btn.dataset.id));
            });
        } else {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="4">No news found</td>';
            newsTableBody.appendChild(row);
        }
    } catch (error) {
        console.error('Error loading news:', error);
        showError('Failed to load news. Please try again.');
    }
}

// Open Edit Modal
async function openEditModal(newsId) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html?status=needlogin';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/news/${newsId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const news = await response.json();

        // Populate form fields
        document.getElementById('editNewsId').value = news._id;
        document.getElementById('editTitle').value = news.title;
        document.getElementById('editCategory').value = news.category;
        document.getElementById('editBody').value = news.body;

        // Show modal
        editNewsModal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching news details:', error);
        showError('Failed to load news details. Please try again.');
    }
}

// Handle Edit News Submit
async function handleEditNewsSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html?status=needlogin';
        return;
    }

    const newsId = document.getElementById('editNewsId').value;
    const title = document.getElementById('editTitle').value;
    const category = document.getElementById('editCategory').value;
    const body = document.getElementById('editBody').value;
    const imageFile = document.getElementById('editImage').files[0];

    // Create FormData object
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('body', body);

    if (imageFile) {
        formData.append('image', imageFile);
    }

    // Show loading state
    const submitButton = editNewsForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Updating...';
    submitButton.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/news/${newsId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || `HTTP error! Status: ${response.status}`);
        }

        // Close modal
        editNewsModal.style.display = 'none';

        // Show success message
        showSuccess('News updated successfully!');

        // Reload news table
        loadNewsTable(currentPage);
    } catch (error) {
        console.error('Update error:', error);
        showError(`Error: ${error.message}`);
    } finally {
        // Reset button state
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
}

// Handle Delete News
async function handleDeleteNews(newsId) {
    // We'll keep the confirm dialog for now as implementing a custom modal would require more changes
    // In a real-world scenario, we would replace this with a custom modal dialog
    if (!confirm('Are you sure you want to delete this news article?')) {
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html?status=needlogin';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/news/${newsId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || `HTTP error! Status: ${response.status}`);
        }

        // Show success message
        showSuccess('News deleted successfully!');

        // Reload news table
        loadNewsTable(currentPage);
    } catch (error) {
        console.error('Delete error:', error);
        showError(`Error: ${error.message}`);
    }
}

// Show Success Message
function showSuccess(message) {
    // Use toast notification
    showSuccessToast(message);
    
    // Also update the existing success message element for backward compatibility
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';

        // Hide after 3 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
    }
}

// Show Error Message
function showError(message) {
    // Use toast notification
    showErrorToast(message);
    
    // Also update the existing error message element for backward compatibility
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';

        // Hide after 5 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
}