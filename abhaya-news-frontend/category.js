// This file handles functionality specific to category pages

// API Base URL
// const API_BASE_URL = '/api';
import API_BASE_URL from './config.js';

// State variables for category pages
let categoryCurrentPage = 1;
let categoryTotalPages = 1;
let currentCategoryName = '';

document.addEventListener('DOMContentLoaded', async function () {
    // Get the current category from the page URL
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');

    // Skip processing if we're on the home page
    if (currentPage === 'index' || currentPage === '') {
        return; // Exit early, let the home page handle its own functionality
    }

    // Map page names to category names
    const pageToCategory = {
        'politics': 'politics',
        'technology': 'technology',
        'sports': 'sports',
        'entertainment': 'entertainment',
        'business': 'business',
        'health': 'health',
        'science': 'science',
        'world': 'world',
        'lifestyle': 'lifestyle',
        'education': 'education'
    };

    currentCategoryName = pageToCategory[currentPage];

    if (!currentCategoryName) {
        console.log('Unknown category page:', currentPage);
        return;
    }

    console.log('Loading category page:', currentCategoryName);

    // Wait for fetchNewsDetail to be available
    // await waitForFetchNewsDetail();

    // Initialize the category page
    initializeCategoryPage();

    // Set up pagination
    setupCategoryPagination();
});

// Wait for fetchNewsDetail to be available
function waitForFetchNewsDetail() {
    return new Promise((resolve) => {
        if (window.fetchNewsDetail) {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (window.fetchNewsDetail) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        }
    });
}

// Initialize category page with real data
async function initializeCategoryPage() {
    await fetchCategoryNews();
    // Only show main category news - no trending, no sliders
}

// Fetch news for the current category
async function fetchCategoryNews() {
    const newsGrid = document.querySelector('.news-grid');
    if (!newsGrid) return;

    showCategoryLoading();

    try {
        const url = `${API_BASE_URL}/news?page=${categoryCurrentPage}&limit=6&category=${currentCategoryName}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        displayCategoryNews(data.news || []);
        updateCategoryPagination(data.currentPage || 1, data.totalPages || 1);

    } catch (error) {
        console.error('Fetch category news error:', error);
        showCategoryError('Failed to load news. Please try again later.');
    }
}

// Display category news in grid
function displayCategoryNews(news) {
    const newsGrid = document.querySelector('.news-grid');
    if (!newsGrid) return;

    if (news.length === 0) {
        newsGrid.innerHTML = `<div class="loading">No ${currentCategoryName} news found. Check back later for updates!</div>`;
        return;
    }

    let html = '';
    news.forEach(article => {
        const date = new Date(article.createdAt).toLocaleDateString();
        const truncatedBody = article.body.length > 150
            ? article.body.substring(0, 150) + '...'
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
    });

    newsGrid.innerHTML = html;

    // Add click event listeners to news cards
    document.querySelectorAll('.news-card').forEach(card => {
        card.addEventListener('click', () => {
            const newsId = card.dataset.id;

            if (window.fetchNewsDetail && newsId) {
                window.fetchNewsDetail(newsId);
            } else {
                console.error('fetchNewsDetail not available or no newsId');
                alert('Unable to open news article. Please try again.');
            }
        });
    });
}

// Fetch trending news for the category
async function fetchTrendingNews() {
    try {
        const url = `${API_BASE_URL}/news?limit=3&category=${currentCategoryName}&sort=createdAt&order=desc`;
        const response = await fetch(url);

        if (!response.ok) {
            return; // Silently fail for trending news
        }

        const data = await response.json();
        updateTrendingSection(data.news || []);

    } catch (error) {
        console.error('Fetch trending news error:', error);
        // Silently fail for trending news
    }
}

// Update trending section with real data
function updateTrendingSection(trendingNews) {
    const trendingCards = document.querySelectorAll('.trending-card');
    if (!trendingCards || trendingCards.length === 0) return;

    trendingCards.forEach((card, index) => {
        if (trendingNews[index]) {
            const article = trendingNews[index];
            const titleElement = card.querySelector('h3');
            const descElement = card.querySelector('p');
            const imgElement = card.querySelector('img');
            const categoryElement = card.querySelector('.news-category');

            if (titleElement) titleElement.textContent = article.title;
            if (descElement) {
                const truncatedBody = article.body.length > 100
                    ? article.body.substring(0, 100) + '...'
                    : article.body;
                descElement.textContent = truncatedBody;
            }
            if (imgElement && article.imageUrl) {
                imgElement.src = article.imageUrl;
                imgElement.alt = article.title;
            }
            if (categoryElement) categoryElement.textContent = article.category;

            // Add click event
            // card.addEventListener('click', () => {
            //     fetchNewsDetail(article._id);
            // });
            card.dataset.id = article._id; // Store ID inside the card

            card.addEventListener('click', () => {
                const newsId = card.dataset.id;
                if (newsId) {
                    fetchNewsDetail(newsId);
                } else {
                    console.error("No newsId found for this card");
                }
            });
        }
    });
}

// Set up pagination for category pages
function setupCategoryPagination() {
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (categoryCurrentPage > 1) {
                categoryCurrentPage--;
                fetchCategoryNews();
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            if (categoryCurrentPage < categoryTotalPages) {
                categoryCurrentPage++;
                fetchCategoryNews();
            }
        });
    }
}

// Update pagination for category pages
function updateCategoryPagination(current, total) {
    categoryCurrentPage = current;
    categoryTotalPages = total;

    const currentPageSpan = document.getElementById('currentPage');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');

    if (currentPageSpan) {
        currentPageSpan.textContent = `Page ${current} of ${total}`;
    }

    if (prevPageBtn) {
        prevPageBtn.disabled = current <= 1;
    }

    if (nextPageBtn) {
        nextPageBtn.disabled = current >= total;
    }
}

// Fetch news detail (reused from app.js)
async function fetchNewsDetail(id) {
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
}

// Display news detail (reused from app.js)
function displayNewsDetail(article) {
    const newsDetailModal = document.getElementById('newsDetailModal');
    const newsDetailContent = document.getElementById('newsDetailContent');

    if (!newsDetailModal || !newsDetailContent) return;

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

// Newsletter form setup
function setupNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value;

            if (email) {
                showSuccessToast(`Thank you for subscribing to our ${currentCategoryName} newsletter!`);
                emailInput.value = '';
            }
        });
    }
}

// Utility functions
function showCategoryLoading() {
    const newsGrid = document.querySelector('.news-grid');
    if (newsGrid) {
        newsGrid.innerHTML = `<div class="loading">Loading ${currentCategoryName} news...</div>`;
    }
}

function showCategoryError(message) {
    const newsGrid = document.querySelector('.news-grid');
    if (newsGrid) {
        newsGrid.innerHTML = `<div class="loading">${message}</div>`;
    }
}




