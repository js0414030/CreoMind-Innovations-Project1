// This file handles functionality specific to category pages

// API Base URL
// const API_BASE_URL = '/api';
import API_BASE_URL from './config.js';
import { showSuccessToast, showErrorToast } from './toast.js';

// Function to get category-specific trending fallback content
function getCategoryTrendingFallback(category) {
    const fallbackContent = {
        'politics': {
            title: 'Political Updates Coming Soon',
            description: 'Stay informed about the latest political developments and government policies.',
            image: 'https://source.unsplash.com/300x200/?politics,government'
        },
        'technology': {
            title: 'Tech Trends on the Horizon',
            description: 'Get ready for the latest technology innovations and digital breakthroughs.',
            image: 'https://source.unsplash.com/300x200/?technology,innovation'
        },
        'sports': {
            title: 'Sports Highlights Loading',
            description: 'Prepare for exciting sports coverage and match analysis.',
            image: 'https://source.unsplash.com/300x200/?sports,football'
        },
        'business': {
            title: 'Business News Incoming',
            description: 'Stay ahead with the latest business insights and market trends.',
            image: 'https://source.unsplash.com/300x200/?business,finance'
        },
        'entertainment': {
            title: 'Entertainment Buzz Building',
            description: 'Get ready for the latest in movies, music, and celebrity news.',
            image: 'https://source.unsplash.com/300x200/?entertainment,cinema'
        },
        'health': {
            title: 'Health Updates Coming',
            description: 'Stay informed about medical breakthroughs and wellness tips.',
            image: 'https://source.unsplash.com/300x200/?health,medical'
        },
        'science': {
            title: 'Scientific Discoveries Await',
            description: 'Explore the latest in scientific research and innovations.',
            image: 'https://source.unsplash.com/300x200/?science,research'
        },
        'world': {
            title: 'Global News Coverage',
            description: 'Stay connected with international affairs and world events.',
            image: 'https://source.unsplash.com/300x200/?world,global'
        },
        'lifestyle': {
            title: 'Lifestyle Trends Emerging',
            description: 'Discover the latest in lifestyle and cultural movements.',
            image: 'https://source.unsplash.com/300x200/?lifestyle,culture'
        },
        'education': {
            title: 'Educational Insights Loading',
            description: 'Stay informed about learning trends and academic achievements.',
            image: 'https://source.unsplash.com/300x200/?education,school'
        }
    };

    return fallbackContent[category] || {
        title: 'News Updates Coming Soon',
        description: 'Stay tuned for the latest news and developments.',
        image: 'https://source.unsplash.com/300x200/?news,newspaper'
    };
}

// Function to get category-specific news grid fallback content
function getCategoryNewsFallback(category) {
    const fallbackContent = {
        'politics': {
            title: 'Political News Section',
            description: 'This section will feature the latest political news, government updates, and policy changes. Our political correspondents are working to bring you comprehensive coverage of all political developments.',
            image: 'https://source.unsplash.com/300x200/?politics,government,congress'
        },
        'technology': {
            title: 'Technology News Hub',
            description: 'Stay ahead with the latest technology news, startup updates, and digital innovations. We cover everything from AI breakthroughs to the newest gadgets and software releases.',
            image: 'https://source.unsplash.com/300x200/?technology,innovation,startup'
        },
        'sports': {
            title: 'Sports News Center',
            description: 'Get the latest sports news, match results, and athlete updates. From football to cricket, we bring you comprehensive coverage of all major sporting events and competitions.',
            image: 'https://source.unsplash.com/300x200/?sports,football,cricket,stadium'
        },
        'business': {
            title: 'Business & Finance News',
            description: 'Stay informed about the latest business developments, market trends, and economic news. Our business section covers corporate updates, financial markets, and economic policies.',
            image: 'https://source.unsplash.com/300x200/?business,finance,corporate,office'
        },
        'entertainment': {
            title: 'Entertainment News',
            description: 'Discover the latest in entertainment, including movie reviews, celebrity news, music updates, and cultural events. We bring you the glitz and glamour of the entertainment world.',
            image: 'https://source.unsplash.com/300x200/?entertainment,cinema,music,celebrity'
        },
        'health': {
            title: 'Health & Wellness News',
            description: 'Stay informed about medical breakthroughs, health tips, and wellness trends. Our health section provides reliable information to help you make informed decisions about your well-being.',
            image: 'https://source.unsplash.com/300x200/?health,medical,wellness,doctor'
        },
        'science': {
            title: 'Science & Research News',
            description: 'Explore the fascinating world of science with the latest discoveries, research findings, and technological innovations. We make complex scientific topics accessible and engaging.',
            image: 'https://source.unsplash.com/300x200/?science,research,laboratory,discovery'
        },
        'world': {
            title: 'World News Coverage',
            description: 'Stay connected with international affairs, global events, and world news. Our world section brings you stories from every corner of the globe, keeping you informed about global developments.',
            image: 'https://source.unsplash.com/300x200/?world,global,international,earth'
        },
        'lifestyle': {
            title: 'Lifestyle & Culture News',
            description: 'Discover the latest in lifestyle trends, cultural events, and social movements. We help you stay in touch with the pulse of modern living and cultural developments.',
            image: 'https://source.unsplash.com/300x200/?lifestyle,culture,fashion,trends'
        },
        'education': {
            title: 'Education News & Updates',
            description: 'Stay informed about educational policies, learning trends, and academic achievements. Our education section supports your journey of lifelong learning and academic growth.',
            image: 'https://source.unsplash.com/300x200/?education,school,university,learning'
        }
    };

    return fallbackContent[category] || {
        title: 'News Section Coming Soon',
        description: 'This section will feature the latest news and updates. Our team is working to bring you comprehensive coverage of all the important stories.',
        image: 'https://source.unsplash.com/300x200/?news,newspaper,media'
    };
}

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
    await fetchTrendingNews();
    setupNewsletterForm();
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
        // Show category-specific fallback content for main news grid
        const fallbackContent = getCategoryNewsFallback(currentCategoryName);
        newsGrid.innerHTML = `
            <div class="news-card fallback-card">
                <div class="news-image">
                    <img src="${fallbackContent.image}" alt="${fallbackContent.title}">
                </div>
                <div class="news-content">
                    <span class="news-category">${currentCategoryName}</span>
                    <h3>${fallbackContent.title}</h3>
                    <p>${fallbackContent.description}</p>
                    <span class="news-date">Coming Soon</span>
                </div>
            </div>
        `;
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
    const trendingGrid = document.querySelector('.trending-grid');
    if (!trendingGrid) return;

    try {
        const url = `${API_BASE_URL}/news?limit=3&category=${currentCategoryName}&sort=createdAt&order=desc`;
        const response = await fetch(url);

        if (!response.ok) {
            trendingGrid.innerHTML = `<div class="loading">No trending ${currentCategoryName} news available</div>`;
            return;
        }

        const data = await response.json();
        const trendingNews = data.news || [];

        if (trendingNews.length === 0) {
            // Show category-specific fallback content for trending section
            const fallbackContent = getCategoryTrendingFallback(currentCategoryName);
            trendingGrid.innerHTML = `
                <div class="trending-card fallback-card">
                    <div class="trending-image">
                        <img src="${fallbackContent.image}" alt="${fallbackContent.title}">
                    </div>
                    <div class="trending-content">
                        <span class="news-category">${currentCategoryName}</span>
                        <h3>${fallbackContent.title}</h3>
                        <p>${fallbackContent.description}</p>
                    </div>
                </div>
            `;
            return;
        }

        // Generate trending cards HTML
        let trendingHTML = '';
        trendingNews.forEach(article => {
            const truncatedBody = article.body.length > 100
                ? article.body.substring(0, 100) + '...'
                : article.body;

            trendingHTML += `
                <div class="trending-card" data-id="${article._id}">
                    <div class="trending-image">
                        <img src="${article.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${article.title}">
                    </div>
                    <div class="trending-content">
                        <span class="news-category">${article.category}</span>
                        <h3>${article.title}</h3>
                        <p>${truncatedBody}</p>
                    </div>
                </div>
            `;
        });

        trendingGrid.innerHTML = trendingHTML;

        // Add click event listeners to trending cards
        document.querySelectorAll('.trending-card').forEach(card => {
            card.addEventListener('click', () => {
                const newsId = card.dataset.id;
                if (newsId && window.fetchNewsDetail) {
                    window.fetchNewsDetail(newsId);
                }
            });
        });

    } catch (error) {
        console.error('Fetch trending news error:', error);
        trendingGrid.innerHTML = `<div class="loading">Failed to load trending ${currentCategoryName} news</div>`;
    }
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

// Make fetchNewsDetail globally available
window.fetchNewsDetail = fetchNewsDetail;

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




