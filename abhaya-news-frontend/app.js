// API Base URL - Use relative path for proxy to work
// const API_BASE_URL = '/api';
import API_BASE_URL from './config.js';

// API Base URL - Use relative path for proxy to work
// const API_BASE_URL = '/api';

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
    if (token && loginBtn) { // fix null check for loginBtn
        loginBtn.textContent = 'Logout';
    }

    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');

    // Show toast messages based on status parameter
    if (status) {
        switch (status) {
            case 'loggedout':
                showSuccessToast('Logged out successfully');
                break;
            case 'needlogin':
                showInfoToast('Please log in to access the admin panel');
                break;
        }

        // Clean up the URL to remove the parameter (without reloading the page)
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
    }
});

// We're now using direct links to category pages, so we don't need this event listener
// This comment is kept to explain the change

// Pagination
if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchNews();
        }
    });
}
if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchNews();
        }
    });
}

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
    if (!newsGrid) return;
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
    if (!newsGrid) return;
    if (news.length === 0) {
        newsGrid.innerHTML = '<div class="loading">No news found</div>';
        return;
    }

    // // If we have featured news, start from the second article
    // const startIndex = currentPage === 1 ? 1 : 0;

    let html = '';

    // for (let i = startIndex; i < news.length; i++) {
    for (let i = 0; i < news.length; i++) {
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

// Fetch News Detail - Make it globally available
window.fetchNewsDetail = async function (id) {
    if (!id) {
        console.error('No news ID provided');
        showErrorToast('Invalid news ID');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/news/${id}`);
        const article = await response.json();

        if (response.ok) {
            displayNewsDetail(article);
        } else {
            showErrorToast(article.message || 'Failed to fetch news detail');
        }
    } catch (error) {
        console.error('Fetch detail error:', error);
        showErrorToast('An error occurred while fetching news detail');
    }
};

// Display News Detail
async function displayNewsDetail(article) {
    // Get modal elements dynamically
    const newsDetailModal = document.getElementById('newsDetailModal');
    const newsDetailContent = document.getElementById('newsDetailContent');

    if (!newsDetailModal || !newsDetailContent) {
        console.error('News detail modal elements not found');
        alert(`News: ${article.title}\n\n${article.body.substring(0, 200)}...`);
        return;
    }

    // Format date and time
    const createdDate = new Date(article.createdAt);
    const formattedDate = createdDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = createdDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Calculate reading time (average 200 words per minute)
    const wordCount = article.body.split(' ').length;
    const readingTime = Math.ceil(wordCount / 200);

    const html = `
        <div class="news-detail-container">
            <!-- Article Header -->
            <div class="news-detail-header">
                <div class="news-category-badge">
                    <i class="fas fa-tag"></i>
                    ${article.category.toUpperCase()}
                </div>
                <h1 class="news-detail-title">${article.title}</h1>

                <!-- Article Meta Information -->
                <div class="news-detail-meta">
                    <div class="meta-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${formattedTime}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-book-open"></i>
                        <span>${readingTime} min read</span>
                    </div>
                </div>
            </div>

            <!-- Article Image -->
            <div class="news-detail-image">
                <img src="${article.imageUrl || 'https://source.unsplash.com/800x400/?news'}" alt="${article.title}">
            </div>

            <!-- Article Content -->
            <div class="news-detail-content">
                <div class="article-body">
                    ${article.body}
                </div>

                <!-- Article Footer -->
                <div class="article-footer">
                    <div class="article-tags">
                        <i class="fas fa-tags"></i>
                        <span class="tag">${article.category}</span>
                        <span class="tag">Breaking News</span>
                        <span class="tag">Latest</span>
                    </div>
                    <div class="article-share">
                        <span>Share this article:</span>
                        <button class="share-btn" onclick="shareArticle('facebook', '${article._id}')">
                            <i class="fab fa-facebook-f"></i>
                        </button>
                        <button class="share-btn" onclick="shareArticle('twitter', '${article._id}')">
                            <i class="fab fa-twitter"></i>
                        </button>
                        <button class="share-btn" onclick="shareArticle('whatsapp', '${article._id}')">
                            <i class="fab fa-whatsapp"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Related News Section -->
            <div class="related-news-section">
                <h3><i class="fas fa-newspaper"></i> Related News</h3>
                <div class="related-news-grid" id="relatedNewsGrid">
                    <div class="loading">Loading related news...</div>
                </div>
            </div>
        </div>
    `;

    newsDetailContent.innerHTML = html;
    newsDetailModal.style.display = 'block';

    // Load related news
    await loadRelatedNews(article.category, article._id);
}

// Load Related News
async function loadRelatedNews(category, currentArticleId) {
    const relatedNewsGrid = document.getElementById('relatedNewsGrid');
    if (!relatedNewsGrid) return;

    try {
        const response = await fetch(`${API_BASE_URL}/news?category=${category}&limit=4`);
        const data = await response.json();

        if (response.ok && data.news) {
            // Filter out current article and limit to 3 related articles
            const relatedArticles = data.news
                .filter(article => article._id !== currentArticleId)
                .slice(0, 3);

            if (relatedArticles.length === 0) {
                relatedNewsGrid.innerHTML = '<div class="no-related">No related articles found.</div>';
                return;
            }

            let relatedHTML = '';
            relatedArticles.forEach(article => {
                const date = new Date(article.createdAt).toLocaleDateString();
                const truncatedTitle = article.title.length > 60
                    ? article.title.substring(0, 60) + '...'
                    : article.title;

                relatedHTML += `
                    <div class="related-news-card" onclick="window.fetchNewsDetail('${article._id}')">
                        <div class="related-news-image">
                            <img src="${article.imageUrl || 'https://source.unsplash.com/300x200/?news'}" alt="${article.title}">
                        </div>
                        <div class="related-news-content">
                            <h4>${truncatedTitle}</h4>
                            <div class="related-news-meta">
                                <span class="related-category">${article.category}</span>
                                <span class="related-date">${date}</span>
                            </div>
                        </div>
                    </div>
                `;
            });

            relatedNewsGrid.innerHTML = relatedHTML;
        } else {
            relatedNewsGrid.innerHTML = '<div class="no-related">Unable to load related articles.</div>';
        }
    } catch (error) {
        console.error('Error loading related news:', error);
        relatedNewsGrid.innerHTML = '<div class="no-related">Failed to load related articles.</div>';
    }
}

// Share Article Function
window.shareArticle = function (platform, articleId) {
    const currentUrl = window.location.origin;
    const articleUrl = `${currentUrl}?article=${articleId}`;
    const title = document.querySelector('.news-detail-title')?.textContent || 'Check out this news article';

    let shareUrl = '';

    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(title)}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + articleUrl)}`;
            break;
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
};

// Update Pagination
function updatePagination(current, total) {
    if (!newsGrid) return;
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
    if (!newsGrid) return;
    newsGrid.innerHTML = `<div class="loading">${message}</div>`;
}




