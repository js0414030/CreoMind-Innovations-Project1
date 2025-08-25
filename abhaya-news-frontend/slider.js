import API_BASE_URL from './config.js';
document.addEventListener('DOMContentLoaded', function () {
    // API Base URL
    // const API_BASE_URL = '/api';


    // Banner Slider Functionality
    let slides = [];
    let dots = [];
    let prevBtn = null;
    let nextBtn = null;
    let currentSlide = 0;
    let slideInterval;
    let sliderContainer = null;

    // Initialize the slider after loading dynamic content
    async function initSlider() {
        // First, load dynamic content for sliders
        await loadSliderContent();

        // Get updated DOM elements after content is loaded
        slides = document.querySelectorAll('.slide');
        dots = document.querySelectorAll('.dot');
        prevBtn = document.querySelector('.prev-btn');
        nextBtn = document.querySelector('.next-btn');
        sliderContainer = document.querySelector('.slider-container');

        if (slides.length === 0) {
            console.log('No slides found, skipping slider initialization');
            return;
        }

        // Hide all slides
        slides.forEach(slide => {
            slide.style.display = 'none';
        });

        // Show the current slide
        if (slides[currentSlide]) {
            slides[currentSlide].style.display = 'block';
        }

        // Update dots
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        if (dots[currentSlide]) {
            dots[currentSlide].classList.add('active');
        }

        // Add event listeners
        setupEventListeners();

        // Start auto-sliding
        startSlideInterval();
    }

    // Load slider content dynamically from API
    async function loadSliderContent() {
        const sliderElement = document.querySelector('.slider');
        const dotsContainer = document.querySelector('.slider-dots');

        if (!sliderElement || !dotsContainer) {
            console.log('Slider elements not found on this page');
            return;
        }

        try {
            // Determine current page category
            const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
            let category = '';

            // Map page names to categories
            const pageToCategory = {
                'index': '', // Home page - get latest from all categories
                'business': 'business',
                'health': 'health',
                'science': 'science',
                'lifestyle': 'lifestyle',
                'education': 'education',
                'world': 'world',
                'technology': 'technology',
                'sports': 'sports',
                'politics': 'politics',
                'entertainment': 'entertainment'
            };

            category = pageToCategory[currentPage] || '';

            // Fetch latest news for slider
            let url = `${API_BASE_URL}/news?limit=3&sort=createdAt&order=desc`;
            if (category) {
                url += `&category=${category}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            const news = data.news || [];

            if (news.length === 0) {
                // If no news found, show a default message
                sliderElement.innerHTML = `
                    <div class="slide active">
                        <div class="slide-content">
                            <h2>Welcome to Abhaya News</h2>
                            <p>Stay updated with the latest news and developments. Check back soon for new content!</p>
                        </div>
                        <img src="https://source.unsplash.com/random/1200x600/?news" alt="News">
                    </div>
                `;
                dotsContainer.innerHTML = '<span class="dot active" data-index="0"></span>';
                return;
            }

            // Generate slider HTML
            let slidesHTML = '';
            let dotsHTML = '';

            news.forEach((article, index) => {
                const isActive = index === 0 ? 'active' : '';
                const truncatedBody = article.body.length > 150
                    ? article.body.substring(0, 150) + '...'
                    : article.body;

                slidesHTML += `
                    <div class="slide ${isActive}" data-id="${article._id}">
                        <div class="slide-content">
                            <h2>${article.title}</h2>
                            <p>${truncatedBody}</p>
                            <a href="#" class="read-more-btn" onclick="fetchNewsDetail('${article._id}')">Read More</a>
                        </div>
                        <img src="${article.imageUrl || 'https://source.unsplash.com/random/1200x600/?news'}" alt="${article.title}">
                    </div>
                `;

                dotsHTML += `<span class="dot ${isActive}" data-index="${index}"></span>`;
            });

            sliderElement.innerHTML = slidesHTML;
            dotsContainer.innerHTML = dotsHTML;

        } catch (error) {
            console.error('Error loading slider content:', error);
            // Fallback content
            sliderElement.innerHTML = `
                <div class="slide active">
                    <div class="slide-content">
                        <h2>Welcome to Abhaya News</h2>
                        <p>Stay updated with the latest news and developments.</p>
                    </div>
                    <img src="https://source.unsplash.com/random/1200x600/?news" alt="News">
                </div>
            `;
            dotsContainer.innerHTML = '<span class="dot active" data-index="0"></span>';
        }
    }

    // Go to a specific slide
    function goToSlide(index) {
        if (!slides || slides.length === 0) return;

        // Reset interval when manually changing slides
        resetSlideInterval();

        // Hide current slide
        if (slides[currentSlide]) {
            slides[currentSlide].style.display = 'none';
        }
        if (dots[currentSlide]) {
            dots[currentSlide].classList.remove('active');
        }

        // Update current slide index
        currentSlide = index;

        // If index is out of bounds, reset to first or last slide
        if (currentSlide < 0) {
            currentSlide = slides.length - 1;
        } else if (currentSlide >= slides.length) {
            currentSlide = 0;
        }

        // Show new current slide
        if (slides[currentSlide]) {
            slides[currentSlide].style.display = 'block';
        }
        if (dots[currentSlide]) {
            dots[currentSlide].classList.add('active');
        }
    }

    // Next slide
    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    // Previous slide
    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    // Start auto-sliding
    function startSlideInterval() {
        if (slides && slides.length > 1) {
            slideInterval = setInterval(() => {
                nextSlide();
            }, 5000); // Change slide every 5 seconds
        }
    }

    // Reset interval
    function resetSlideInterval() {
        clearInterval(slideInterval);
        startSlideInterval();
    }

    // Setup event listeners
    function setupEventListeners() {
        // Event listeners for navigation buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', prevSlide);
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', nextSlide);
        }

        // Dot navigation
        if (dots) {
            dots.forEach(dot => {
                dot.addEventListener('click', () => {
                    const slideIndex = parseInt(dot.dataset.index);
                    goToSlide(slideIndex);
                });
            });
        }

        // Pause auto-sliding when hovering over the slider
        if (sliderContainer) {
            sliderContainer.addEventListener('mouseenter', () => {
                clearInterval(slideInterval);
            });

            sliderContainer.addEventListener('mouseleave', () => {
                startSlideInterval();
            });
        }
    }

    // Load trending news for trending sections
    async function loadTrendingNews() {
        const trendingGrid = document.querySelector('.trending-grid');
        if (!trendingGrid) return;

        try {
            // Determine current page category
            const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
            let category = '';

            const pageToCategory = {
                'index': '', // Home page - get trending from all categories
                'business': 'business',
                'health': 'health',
                'science': 'science',
                'lifestyle': 'lifestyle',
                'education': 'education',
                'world': 'world',
                'technology': 'technology',
                'sports': 'sports',
                'politics': 'politics',
                'entertainment': 'entertainment'
            };

            category = pageToCategory[currentPage] || '';

            // Fetch trending news
            let url = `${API_BASE_URL}/news?limit=3&sort=createdAt&order=desc`;
            if (category) {
                url += `&category=${category}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            const news = data.news || [];

            if (news.length === 0) {
                trendingGrid.innerHTML = '<div class="loading">No trending news available at the moment.</div>';
                return;
            }

            // Generate trending cards HTML
            let trendingHTML = '';
            news.forEach((article, index) => {
                const truncatedBody = article.body.length > 100
                    ? article.body.substring(0, 100) + '...'
                    : article.body;

                trendingHTML += `
                    <div class="trending-card" data-id="${article._id}">
                        <div class="trending-image">
                            <span class="trending-badge">${index + 1}</span>
                            <img src="${article.imageUrl || 'https://source.unsplash.com/random/300x200/?news'}" alt="${article.title}">
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
                    if (typeof fetchNewsDetail === 'function') {
                        fetchNewsDetail(newsId);
                    }
                });
            });

        } catch (error) {
            console.error('Error loading trending news:', error);
            trendingGrid.innerHTML = '<div class="loading">Failed to load trending news.</div>';
        }
    }

    // Load category highlights for home page
    async function loadCategoryHighlights() {
        const categoryHighlights = document.querySelector('.category-highlights');
        if (!categoryHighlights) return;

        try {
            // Categories to fetch for home page highlights
            const categories = ['politics', 'technology', 'business', 'health'];
            let categoryHTML = '';

            for (const category of categories) {
                const response = await fetch(`${API_BASE_URL}/news?limit=2&category=${category}&sort=createdAt&order=desc`);
                if (!response.ok) continue;

                const data = await response.json();
                const news = data.news || [];

                if (news.length === 0) continue;

                // Category icons mapping
                const categoryIcons = {
                    'politics': 'fas fa-landmark',
                    'technology': 'fas fa-microchip',
                    'business': 'fas fa-chart-line',
                    'health': 'fas fa-heartbeat'
                };

                categoryHTML += `
                    <div class="category-row">
                        <div class="category-header">
                            <h2 class="section-title"><i class="${categoryIcons[category]}"></i> ${category.charAt(0).toUpperCase() + category.slice(1)}</h2>
                            <a href="${category}.html" class="view-all">View All</a>
                        </div>
                        <div class="category-cards">
                `;

                news.forEach(article => {
                    const truncatedBody = article.body.length > 120
                        ? article.body.substring(0, 120) + '...'
                        : article.body;

                    categoryHTML += `
                        <div class="category-card" data-id="${article._id}">
                            <img src="${article.imageUrl || 'https://source.unsplash.com/random/400x250/?news'}" alt="${article.title}">
                            <div class="category-card-content">
                                <h3>${article.title}</h3>
                                <p>${truncatedBody}</p>
                            </div>
                        </div>
                    `;
                });

                categoryHTML += `
                        </div>
                    </div>
                `;
            }

            categoryHighlights.innerHTML = categoryHTML;

            // Add click event listeners to category cards
            document.querySelectorAll('.category-card').forEach(card => {
                card.addEventListener('click', () => {
                    const newsId = card.dataset.id;
                    if (window.fetchNewsDetail) {
                        window.fetchNewsDetail(newsId);
                    }
                });
            });

        } catch (error) {
            console.error('Error loading category highlights:', error);
        }
    }

    // Initialize everything
    async function initialize() {
        await initSlider();
        await loadTrendingNews();

        // Load category highlights only on home page
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
        if (currentPage === 'index' || currentPage === '') {
            await loadCategoryHighlights();
        }
    }

    // Start initialization
    initialize();

    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value;

            // Simple validation
            if (email) {
                // Here you would typically send this to your backend
                alert(`Thank you for subscribing with ${email}! You'll receive our newsletter soon.`);
                emailInput.value = '';
            }
        });
    }

    // fetchNewsDetail is handled by app.js globally - no need to override here
});