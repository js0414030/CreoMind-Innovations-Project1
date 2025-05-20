// API Base URL - Use relative path for proxy to work
const API_BASE_URL = '/api';

// State variables
let currentPage = 1;
let totalPages = 1;
let currentCategory = 'all';
let token = localStorage.getItem('token');

// DOM Elements
const newsGrid = document.querySelector('.news-grid');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const currentPageSpan = document.getElementById('currentPage');
const categoryLinks = document.querySelectorAll('nav ul li a');
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const closeLoginModal = document.querySelector('#loginModal .close');
const newsDetailModal = document.getElementById('newsDetailModal');
const newsDetailContent = document.getElementById('newsDetailContent');
const closeNewsDetailModal = document.querySelector('#newsDetailModal .close');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchNews();

    // Check if user is logged in
    if (token) {
        loginBtn.textContent = 'Logout';
    }
});

// We're now using direct links to category pages, so we don't need this event listener
// This comment is kept to explain the change

// Pagination
prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchNews();
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        fetchNews();
    }
});

// Login button is now handled by components.js

// Close News Detail Modal
closeNewsDetailModal.addEventListener('click', () => {
    newsDetailModal.style.display = 'none';
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === newsDetailModal) {
        newsDetailModal.style.display = 'none';
    }
});

// Login form submission is now handled by components.js

// Fetch News from API
async function fetchNews() {
    showLoading();

    try {
        let url = `${API_BASE_URL}/news?page=${currentPage}&limit=6`;

        // We're now using separate pages for categories, but keeping this for API compatibility
        // This will only be used on the home page
        if (currentCategory !== 'all' && currentCategory) {
            url += `&category=${currentCategory}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        displayNews(data.news || []);
        updatePagination(data.currentPage || 1, data.totalPages || 1);

        // We're not displaying featured news anymore since we have a static banner slider
        // But we can still log it for reference
        if (data.news && data.news.length > 0 && currentPage === 1) {
            console.log("First article available for featured section:", data.news[0]);
        }
    } catch (error) {
        console.error('Fetch error:', error);
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            showError('Cannot connect to the server. Please make sure the backend is running.');
        } else {
            showError('An error occurred while fetching news: ' + error.message);
        }
    }
}

// Display News in Grid
function displayNews(news) {
    if (news.length === 0) {
        newsGrid.innerHTML = '<div class="loading">No news found</div>';
        return;
    }

    // If we have featured news, start from the second article
    const startIndex = currentPage === 1 ? 1 : 0;

    let html = '';

    for (let i = startIndex; i < news.length; i++) {
        const article = news[i];
        const date = new Date(article.createdAt).toLocaleDateString();
        const truncatedBody = article.body.length > 100
            ? article.body.substring(0, 100) + '...'
            : article.body;

        html += `
            <div class="news-card" data-id="${article._id}">
                <div class="news-image">
                    <img src="${article.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${article.title}">
                </div>
                <div class="news-content">
                    <span class="news-category">${article.category}</span>
                    <h3>${article.title}</h3>
                    <p>${truncatedBody}</p>
                    <span class="news-date">${date}</span>
                </div>
            </div>
        `;
    }

    newsGrid.innerHTML = html;

    // Add event listeners to news cards
    document.querySelectorAll('.news-card').forEach(card => {
        card.addEventListener('click', () => {
            const newsId = card.dataset.id;
            fetchNewsDetail(newsId);
        });
    });
}

// We're not using the displayFeaturedNews function anymore since we have a static banner slider
// This function is kept for reference but not used
function displayFeaturedNews(article) {
    // Function kept for compatibility but not used
    console.log("Featured article available:", article);
}

// Fetch News Detail
async function fetchNewsDetail(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/news/${id}`);
        const article = await response.json();

        if (response.ok) {
            displayNewsDetail(article);
        } else {
            alert(article.message || 'Failed to fetch news detail');
        }
    } catch (error) {
        console.error('Fetch detail error:', error);
        alert('An error occurred while fetching news detail');
    }
}

// Display News Detail
function displayNewsDetail(article) {
    const date = new Date(article.createdAt).toLocaleDateString();

    const html = `
        <div class="news-detail-header">
            <h2>${article.title}</h2>
            <div class="news-detail-meta">
                <span class="news-category">${article.category}</span>
                <span class="news-date">${date}</span>
            </div>
        </div>
        <div class="news-detail-image">
            <img src="${article.imageUrl || 'https://via.placeholder.com/800x400?text=No+Image'}" alt="${article.title}">
        </div>
        <div class="news-detail-content">
            ${article.body}
        </div>
    `;

    newsDetailContent.innerHTML = html;
    newsDetailModal.style.display = 'block';
}

// Update Pagination
function updatePagination(current, total) {
    currentPage = current;
    totalPages = total;

    currentPageSpan.textContent = `Page ${current} of ${total}`;

    prevPageBtn.disabled = current <= 1;
    nextPageBtn.disabled = current >= total;
}

// Show Loading State
function showLoading() {
    newsGrid.innerHTML = '<div class="loading">Loading news...</div>';
}

// Show Error Message
function showError(message) {
    newsGrid.innerHTML = `<div class="loading">${message}</div>`;
}