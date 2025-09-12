// API Base URL - Use relative path for proxy to work
// const API_BASE_URL = '/api';
import API_BASE_URL from './config.js';
import { showSuccessToast, showErrorToast } from './toast.js';

// DOM Elements - News
const uploadForm = document.getElementById('uploadForm');
const logoutBtn = document.getElementById('logoutBtn');
const newsTableBody = document.getElementById('newsTableBody');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageInfo = document.getElementById('pageInfo');
const editNewsModal = document.getElementById('editNewsModal');
const editNewsForm = document.getElementById('editNewsForm');
const closeEditModal = document.getElementById('closeEditModal');

// DOM Elements - YouTube Videos
const uploadVideoForm = document.getElementById('uploadVideoForm');
const videoTableBody = document.getElementById('videoTableBody');
const prevVideoPageBtn = document.getElementById('prevVideoPageBtn');
const nextVideoPageBtn = document.getElementById('nextVideoPageBtn');
const videoPageInfo = document.getElementById('videoPageInfo');
const editVideoModal = document.getElementById('editVideoModal');
const editVideoForm = document.getElementById('editVideoForm');
const closeEditVideoModal = document.getElementById('closeEditVideoModal');

// DOM Elements - Popup News
const popupNewsForm = document.getElementById('popupNewsForm');
const popupIdInput = document.getElementById('popupId');
const savePopupBtn = document.getElementById('savePopupBtn');
const deletePopupBtn = document.getElementById('deletePopupBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const popupNewsTableBody = document.getElementById('popupNewsTableBody');

// Popup News CRUD/Activation Logic
async function fetchPopupNews() {
    const res = await fetch('/api/popup-news');
    return res.ok ? await res.json() : [];
}

function renderPopupNewsTable(newsList) {
    popupNewsTableBody.innerHTML = '';
    newsList.forEach(news => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${news.title}</td>
            <td>${news.image ? `<img src="${news.image}" style="max-width:80px;max-height:40px;">` : ''}</td>
            <td>${news.isActive ? '<span style="color:green;font-weight:bold;">Active</span>' : ''}</td>
            <td>
                <button class="edit-btn" data-id="${news._id}">Edit</button>
                <button class="delete-btn" data-id="${news._id}">Delete</button>
                ${!news.isActive ? `<button class="activate-btn" data-id="${news._id}">Activate</button>` : ''}
            </td>
        `;
        popupNewsTableBody.appendChild(tr);
    });

    // Add event listeners
    popupNewsTableBody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = () => startEditPopupNews(btn.dataset.id);
    });
    popupNewsTableBody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = () => deletePopupNews(btn.dataset.id);
    });
    popupNewsTableBody.querySelectorAll('.activate-btn').forEach(btn => {
        btn.onclick = () => activatePopupNews(btn.dataset.id);
    });
}

async function refreshPopupNewsTable() {
    const newsList = await fetchPopupNews();
    renderPopupNewsTable(newsList);
    clearPopupForm();
}

function clearPopupForm() {
    popupIdInput.value = '';
    popupNewsForm.reset();
    savePopupBtn.textContent = 'Save Popup News';
    deletePopupBtn.style.display = 'none';
    cancelEditBtn.style.display = 'none';
}

function startEditPopupNews(id) {
    fetch(`/api/popup-news`).then(res => res.json()).then(newsList => {
        const news = newsList.find(n => n._id === id);
        if (!news) return;
        popupIdInput.value = news._id;
        document.getElementById('popupTitle').value = news.title;
        document.getElementById('popupDescription').value = news.description;
        document.getElementById('popupLink').value = news.link || '';
        document.getElementById('popupVideoLink').value = news.videoLink || '';
        document.getElementById('popupActive').checked = !!news.isActive;
        savePopupBtn.textContent = 'Update Popup News';
        deletePopupBtn.style.display = 'inline-block';
        cancelEditBtn.style.display = 'inline-block';
    });
}

async function deletePopupNews(id) {
    if (!confirm('Delete this popup news?')) return;
    await fetch(`/api/popup-news/${id}`, { method: 'DELETE' });
    refreshPopupNewsTable();
}

async function activatePopupNews(id) {
    await fetch(`/api/popup-news/${id}/activate`, { method: 'PATCH' });
    refreshPopupNewsTable();
}

popupNewsForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = popupIdInput.value;
    const title = document.getElementById('popupTitle').value;
    const description = document.getElementById('popupDescription').value;
    const link = document.getElementById('popupLink').value;
    const videoLink = document.getElementById('popupVideoLink').value;
    const isActive = document.getElementById('popupActive').checked;
    const imageInput = document.getElementById('popupImage');
    let imageUrl = '';
    if (imageInput.files && imageInput.files[0]) {
        const formData = new FormData();
        formData.append('image', imageInput.files[0]);
        const res = await fetch('/api/upload-popup-image', { method: 'POST', body: formData });
        const data = await res.json();
        imageUrl = data.imageUrl;
    }
    const payload = { title, description, link, videoLink, isActive };
    if (imageUrl) payload.image = imageUrl;
    if (id) {
        // Update
        await fetch(`/api/popup-news/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } else {
        // Create
        await fetch('/api/popup-news', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    }
    refreshPopupNewsTable();
};

deletePopupBtn.onclick = () => {
    const id = popupIdInput.value;
    if (id) deletePopupNews(id);
};

cancelEditBtn.onclick = clearPopupForm;

// Initial load
refreshPopupNewsTable();


// Pagination state - News
let currentPage = 1;
let totalPages = 1;
const limit = 10;

// Pagination state - YouTube Videos
let currentVideoPage = 1;
let totalVideoPages = 1;
const videoLimit = 10;

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

    // Load YouTube videos table
    if (videoTableBody) {
        loadVideosTable(currentVideoPage);
    }

    // Set up pagination event listeners for news
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

    // Set up pagination event listeners for videos
    prevVideoPageBtn.addEventListener('click', () => {
        if (currentVideoPage > 1) {
            loadVideosTable(currentVideoPage - 1);
        }
    });

    nextVideoPageBtn.addEventListener('click', () => {
        if (currentVideoPage < totalVideoPages) {
            loadVideosTable(currentVideoPage + 1);
        }
    });

    // Set up modal close events
    closeEditModal.addEventListener('click', () => {
        editNewsModal.style.display = 'none';
    });

    if (closeEditVideoModal) {
        closeEditVideoModal.addEventListener('click', () => {
            editVideoModal.style.display = 'none';
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editNewsModal) {
            editNewsModal.style.display = 'none';
        }
        if (e.target === editVideoModal) {
            editVideoModal.style.display = 'none';
        }
    });

    // Set up form submissions
    editNewsForm.addEventListener('submit', handleEditNewsSubmit);

    // Set up video form submissions
    if (uploadVideoForm) {
        uploadVideoForm.addEventListener('submit', handleUploadVideo);
    }

    if (editVideoForm) {
        editVideoForm.addEventListener('submit', handleEditVideoSubmit);
    }
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

// YouTube Video Management Functions

// Handle Upload Video
async function handleUploadVideo(e) {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        showErrorToast('You must be logged in to upload videos');
        setTimeout(() => {
            window.location.href = 'index.html?status=needlogin';
        }, 1000);
        return;
    }

    const title = document.getElementById('videoTitle').value;
    const videoUrl = document.getElementById('videoUrl').value;
    const category = document.getElementById('videoCategory').value;
    const description = document.getElementById('videoDescription').value || '';

    // Validate YouTube URL
    if (!isValidYoutubeUrl(videoUrl)) {
        showErrorToast('Please enter a valid YouTube video URL');
        return;
    }

    // Show loading state
    const submitButton = uploadVideoForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Uploading...';
    submitButton.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/youtube`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                videoUrl,
                category,
                description
            })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Show success message with toast
        showSuccessToast('YouTube video added successfully!');

        // Reset form
        uploadVideoForm.reset();

        // Reload videos table to show the new entry
        if (videoTableBody) {
            loadVideosTable(1); // Reset to first page to show the new video
        }
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
    }
}


// Load Videos Table (Optimized Single Version)
async function loadVideosTable(page) {
    // Early return if no table body exists
    if (!videoTableBody) return;

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html?status=needlogin';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/youtube?page=${page}&limit=${videoLimit}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Update pagination state
        currentVideoPage = data.currentPage || 1;
        totalVideoPages = data.totalPages || 1;

        // Safely update pagination UI (with null checks)
        if (videoPageInfo) videoPageInfo.textContent = `Page ${currentVideoPage} of ${totalVideoPages}`;
        if (prevVideoPageBtn) prevVideoPageBtn.disabled = currentVideoPage <= 1;
        if (nextVideoPageBtn) nextVideoPageBtn.disabled = currentVideoPage >= totalVideoPages;

        // Clear table
        videoTableBody.innerHTML = '';

        // Add video items to table
        if (data.videos?.length > 0) {
            data.videos.forEach(video => {
                const row = document.createElement('tr');
                const date = new Date(video.createdAt).toLocaleDateString();

                // Improved thumbnail handling
                const videoId = extractYoutubeVideoId(video.link);
                const thumbnailUrl = video.thumbnailUrl ||
                    (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` :
                        'https://via.placeholder.com/120x68?text=No+Thumbnail');

                row.innerHTML = `
                    <td>
                        <img src="${thumbnailUrl}" 
                             alt="${video.title}" 
                             style="width: 120px; height: 68px; object-fit: cover;">
                    </td>
                    <td>${video.title}</td>
                    <td>${video.category}</td>
                    <td>${date}</td>
                    <td class="action-buttons">
                        <button class="edit-video-btn" data-id="${video._id}">Edit</button>
                        <button class="delete-video-btn" data-id="${video._id}">Delete</button>
                    </td>
                `;

                videoTableBody.appendChild(row);
            });

            // Add event listeners
            document.querySelectorAll('.edit-video-btn').forEach(btn => {
                btn.addEventListener('click', () => openEditVideoModal(btn.dataset.id));
            });

            document.querySelectorAll('.delete-video-btn').forEach(btn => {
                btn.addEventListener('click', () => handleDeleteVideo(btn.dataset.id));
            });
        } else {
            videoTableBody.innerHTML = '<tr><td colspan="5">No videos found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        videoTableBody.innerHTML = '<tr><td colspan="5">Failed to load videos. Please try again.</td></tr>';
    }
}


// // Load Videos Table
// async function loadVideosTable(page) {
//     const token = localStorage.getItem('token');
//     if (!token) {
//         window.location.href = 'index.html?status=needlogin';
//         return;
//     }

//     try {
//         const response = await fetch(`${API_BASE_URL}/youtube?page=${page}&limit=${videoLimit}`, {
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }

//         const data = await response.json();

//         // Update pagination state
//         currentVideoPage = data.currentPage || 1;
//         totalVideoPages = data.totalPages || 1;

//         // Update pagination UI
//         videoPageInfo.textContent = `Page ${currentVideoPage} of ${totalVideoPages}`;
//         prevVideoPageBtn.disabled = currentVideoPage <= 1;
//         nextVideoPageBtn.disabled = currentVideoPage >= totalVideoPages;

//         // Clear table
//         videoTableBody.innerHTML = '';

//         // Add video items to table
//         if (data.videos && data.videos.length > 0) {
//             data.videos.forEach(video => {
//                 const row = document.createElement('tr');

//                 // Format date
//                 const date = new Date(video.createdAt).toLocaleDateString();

//                 row.innerHTML = `
//                     <td>
//                         <img src="${video.thumbnailUrl || 'https://via.placeholder.com/120x68?text=No+Thumbnail'}" 
//                              alt="${video.title}" 
//                              style="width: 120px; height: 68px; object-fit: cover;">
//                     </td>
//                     <td>${video.title}</td>
//                     <td>${video.category}</td>
//                     <td>${date}</td>
//                     <td class="action-buttons">
//                         <button class="edit-video-btn" data-id="${video._id}">Edit</button>
//                         <button class="delete-video-btn" data-id="${video._id}">Delete</button>
//                     </td>
//                 `;

//                 videoTableBody.appendChild(row);
//             });

//             // Add event listeners to buttons
//             document.querySelectorAll('.edit-video-btn').forEach(btn => {
//                 btn.addEventListener('click', () => openEditVideoModal(btn.dataset.id));
//             });

//             document.querySelectorAll('.delete-video-btn').forEach(btn => {
//                 btn.addEventListener('click', () => handleDeleteVideo(btn.dataset.id));
//             });
//         } else {
//             const row = document.createElement('tr');
//             row.innerHTML = '<td colspan="5">No videos found</td>';
//             videoTableBody.appendChild(row);
//         }
//     } catch (error) {
//         console.error('Error loading videos:', error);
//         showError('Failed to load videos. Please try again.');
//     }
// }

// Open Edit Video Modal
async function openEditVideoModal(videoId) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html?status=needlogin';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/youtube/${videoId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const video = await response.json();

        // Populate form fields
        document.getElementById('editVideoId').value = video._id;
        document.getElementById('editVideoTitle').value = video.title;
        // document.getElementById('editVideoUrl').value = video.videoUrl;
        document.getElementById('editVideoUrl').value = video.link;
        document.getElementById('editVideoCategory').value = video.category || 'general';
        document.getElementById('editVideoDescription').value = video.description || '';

        // Show thumbnail preview
        const thumbnailPreview = document.getElementById('videoThumbnailPreview');
        if (thumbnailPreview) {
            const videoId = extractYoutubeVideoId(video.link);
            const thumbnailUrl = video.thumbnailUrl ||
                (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` :
                    'https://via.placeholder.com/320x180?text=No+Thumbnail');

            thumbnailPreview.src = thumbnailUrl;
            thumbnailPreview.alt = video.title;
        }

        // Show modal
        editVideoModal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching video details:', error);
        showErrorToast('Failed to load video details. Please try again.');
    }
}

// Handle Edit Video Submit
async function handleEditVideoSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html?status=needlogin';
        return;
    }

    const videoId = document.getElementById('editVideoId').value;
    const title = document.getElementById('editVideoTitle').value;
    const videoUrl = document.getElementById('editVideoUrl').value;
    const category = document.getElementById('editVideoCategory').value;
    const description = document.getElementById('editVideoDescription').value || '';

    // Validate YouTube URL
    if (!isValidYoutubeUrl(videoUrl)) {
        showErrorToast('Please enter a valid YouTube video URL');
        return;
    }

    // Show loading state
    const submitButton = editVideoForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Updating...';
    submitButton.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/youtube/${videoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                videoUrl,
                category,
                description
            })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || `HTTP error! Status: ${response.status}`);
        }

        // Close modal
        editVideoModal.style.display = 'none';

        // Show success message
        showSuccessToast('YouTube video updated successfully!');

        // Reload videos table
        if (videoTableBody) {
            loadVideosTable(currentVideoPage);
        }
    } catch (error) {
        console.error('Update error:', error);
        showErrorToast(`Error: ${error.message}`);
    } finally {
        // Reset button state
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
}

// Handle Delete Video
async function handleDeleteVideo(videoId) {
    if (!confirm('Are you sure you want to delete this YouTube video?')) {
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html?status=needlogin';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/youtube/${videoId}`, {
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
        showSuccessToast('YouTube video deleted successfully!');

        // Reload videos table
        if (videoTableBody) {
            // If we're on the last page and there's only one video, go to previous page
            if (currentVideoPage > 1 && document.querySelectorAll('#videoTableBody tr').length === 1) {
                currentVideoPage--;
            }
            loadVideosTable(currentVideoPage);
        }
    } catch (error) {
        console.error('Delete error:', error);
        showErrorToast(`Error: ${error.message}`);
    }
}

// Helper function to validate YouTube URL
function isValidYoutubeUrl(url) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
}

// // Load Videos Table
// async function loadVideosTable(page) {
//     if (!videoTableBody) return;

//     const token = localStorage.getItem('token');
//     if (!token) {
//         window.location.href = 'index.html?status=needlogin';
//         return;
//     }

//     try {
//         const response = await fetch(`${API_BASE_URL}/youtube?page=${page}&limit=${videoLimit}`, {
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }

//         const data = await response.json();

//         // Update pagination state
//         currentVideoPage = data.currentPage || 1;
//         totalVideoPages = data.totalPages || 1;

//         // Update pagination UI
//         if (videoPageInfo) {
//             videoPageInfo.textContent = `Page ${currentVideoPage} of ${totalVideoPages}`;
//         }
//         if (prevVideoPageBtn) {
//             prevVideoPageBtn.disabled = currentVideoPage <= 1;
//         }
//         if (nextVideoPageBtn) {
//             nextVideoPageBtn.disabled = currentVideoPage >= totalVideoPages;
//         }

//         // Clear table
//         videoTableBody.innerHTML = '';

//         // Add video items to table
//         if (data.videos && data.videos.length > 0) {
//             data.videos.forEach(video => {
//                 const row = document.createElement('tr');

//                 // Format date
//                 const date = new Date(video.createdAt).toLocaleDateString();

//                 // Extract video ID for thumbnail
//                 const videoId = extractYoutubeVideoId(video.link);
//                 const thumbnailUrl = video.thumbnailUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : 'https://via.placeholder.com/120x68?text=No+Thumbnail');

//                 row.innerHTML = `
//                     <td>
//                         <img src="${thumbnailUrl}" 
//                              alt="${video.title}" 
//                              style="width: 120px; height: 68px; object-fit: cover;">
//                     </td>
//                     <td>${video.title}</td>
//                     <td>${video.category}</td>
//                     <td>${date}</td>
//                     <td class="action-buttons">
//                         <button class="edit-video-btn" data-id="${video._id}">Edit</button>
//                         <button class="delete-video-btn" data-id="${video._id}">Delete</button>
//                     </td>
//                 `;

//                 videoTableBody.appendChild(row);
//             });

//             // Add event listeners to buttons
//             document.querySelectorAll('.edit-video-btn').forEach(btn => {
//                 btn.addEventListener('click', () => openEditVideoModal(btn.dataset.id));
//             });

//             document.querySelectorAll('.delete-video-btn').forEach(btn => {
//                 btn.addEventListener('click', () => handleDeleteVideo(btn.dataset.id));
//             });
//         } else {
//             const row = document.createElement('tr');
//             row.innerHTML = '<td colspan="5">No videos found</td>';
//             videoTableBody.appendChild(row);
//         }
//     } catch (error) {
//         console.error('Error loading videos:', error);
//         videoTableBody.innerHTML = '<tr><td colspan="5">Failed to load videos. Please try again.</td></tr>';
//     }
// }

// Helper function to extract YouTube video ID
function extractYoutubeVideoId(url) {
    if (!url) return null;

    // Regular expressions to match different YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11) ? match[2] : null;
}

// Popup News Management Functions

