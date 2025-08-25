import API_BASE_URL from './config.js';

// Breaking News Ticker Functionality
class BreakingNewsTicker {
    constructor() {
        this.ticker = document.getElementById('breakingNewsTicker');
        this.breakingNewsData = [];
        this.currentIndex = 0;
        this.isLoading = false;
        this.cache = {
            data: null,
            timestamp: 0,
            duration: 2 * 60 * 1000 // Cache for 2 minutes
        };

        this.init();
    }

    init() {
        // Show sample news immediately for instant display
        this.showInstantNews();

        // Setup event listeners first
        this.setupEventListeners();

        // Load real breaking news in background (non-blocking)
        setTimeout(() => this.loadBreakingNews(), 0);
        this.startAutoRefresh();
    }

    setupEventListeners() {
        // Click on news item to open full article
        this.ticker.addEventListener('click', (e) => {
            if (e.target.classList.contains('breaking-news-item')) {
                const newsId = e.target.dataset.newsId;
                const newsUrl = e.target.dataset.url;
                if (newsId) {
                    this.openNewsArticle(newsId, newsUrl);
                }
            }
        });
    }

    showInstantNews() {
        // Show sample news immediately for instant display
        const instantNews = [
            "తెలంగాణ రాష్ట్రంలో కొత్త పథకం ప్రారంభం - ప్రభుత్వం ప్రకటన",
            "హైదరాబాద్‌లో మెట్రో రైలు కొత్త మార్గం - ప్రయాణికులకు సంతోషం",
            "ఆంధ్రప్రదేశ్‌లో వర్షాలు - రైతులకు ఊరట",
            "విజయవాడలో కొత్త ఆసుపత్రి ప్రారంభం - ప్రజలకు మెరుగైన వైద్య సేవలు"
        ];

        const newsItems = instantNews.map((title, index) =>
            `<span class="breaking-news-item" data-news-id="temp-${index}">
                ${title}
            </span>`
        ).join('');

        this.ticker.innerHTML = newsItems;
    }

    async loadBreakingNews() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;

            // Check cache first
            const now = Date.now();
            if (this.cache.data && (now - this.cache.timestamp) < this.cache.duration) {
                this.breakingNewsData = this.cache.data;
                this.renderBreakingNews();
                return;
            }

            // Fetch fresh data
            this.breakingNewsData = await this.fetchBreakingNews();

            // Update cache
            this.cache.data = this.breakingNewsData;
            this.cache.timestamp = now;

            this.renderBreakingNews();
        } catch (error) {
            console.error('Error loading breaking news:', error);
            this.showFallbackNews();
        } finally {
            this.isLoading = false;
        }
    }

    async fetchBreakingNews() {
        try {
            // First try to use preloaded data if available
            if (window.breakingNewsPreload) {
                try {
                    const data = await window.breakingNewsPreload;
                    if (data && data.news && data.news.length > 0) {
                        // Clear preload promise after use
                        window.breakingNewsPreload = null;

                        return data.news.map(news => ({
                            id: news._id,
                            title: news.title,
                            timestamp: new Date(news.createdAt),
                            priority: this.determinePriority(news),
                            active: true,
                            category: news.category,
                            url: null // Will use modal system
                        }));
                    }
                } catch (preloadError) {
                    console.log('Preloaded data failed, fetching fresh:', preloadError.message);
                    window.breakingNewsPreload = null;
                }
            }

            // Fallback to fresh fetch if preload failed or unavailable
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // Reduced to 2 seconds



            const response = await fetch(`${API_BASE_URL}/news?limit=8&page=1&fields=_id,title,createdAt,category`, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                if (data.news && data.news.length > 0) {
                    return data.news.map(news => ({
                        id: news._id,
                        title: news.title,
                        timestamp: new Date(news.createdAt),
                        priority: this.determinePriority(news),
                        active: true,
                        category: news.category,
                        url: null // Will use modal system
                    }));
                }
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn('Breaking news fetch timed out');
            } else {
                console.error('Error fetching from backend:', error);
            }
        }



        // Final fallback to sample data
        return [
            {
                id: 'fallback-1',
                title: "తెలంగాణ రాష్ట్రంలో కొత్త పథకం ప్రారంభం - ప్రభుత్వం ప్రకటన",
                timestamp: new Date(),
                priority: 'high',
                active: true,
                category: 'politics'
            },
            {
                id: 'fallback-2',
                title: "హైదరాబాద్‌లో మెట్రో రైలు కొత్త మార్గం - ప్రయాణికులకు సంతోషం",
                timestamp: new Date(),
                priority: 'medium',
                active: true,
                category: 'transport'
            }
        ];
    }

    // Determine priority based on news age and category
    determinePriority(news) {
        const now = new Date();
        const newsDate = new Date(news.createdAt);
        const hoursDiff = (now - newsDate) / (1000 * 60 * 60);

        // Recent news (less than 2 hours) gets high priority
        if (hoursDiff < 2) return 'high';
        // News less than 12 hours gets medium priority
        if (hoursDiff < 12) return 'medium';
        // Older news gets low priority
        return 'low';
    }

    renderBreakingNews() {
        if (!this.breakingNewsData.length) {
            this.showFallbackNews();
            return;
        }

        const newsItems = this.breakingNewsData.map(news =>
            `<span class="breaking-news-item" data-news-id="${news.id}" data-url="${news.url || ''}" title="Click to read full article">
                ${news.title}
            </span>`
        ).join('');

        this.ticker.innerHTML = newsItems;
    }

    showFallbackNews() {
        this.ticker.innerHTML = `
            <span class="breaking-news-item">
                అభయ న్యూస్‌కు స్వాగతం - తాజా వార్తల కోసం మమ్మల్ని అనుసరించండి
            </span>
        `;
    }

    openNewsArticle(newsId, newsUrl) {
        // Use the existing fetchNewsDetail function to open article in modal
        if (window.fetchNewsDetail && typeof window.fetchNewsDetail === 'function') {
            window.fetchNewsDetail(newsId);
        } else {
            // Fallback: redirect to custom URL if provided, otherwise to backend API
            if (newsUrl && newsUrl !== '') {
                window.location.href = newsUrl;
            } else {
                window.location.href = `${API_BASE_URL}/news/${newsId}`;
            }
        }

        console.log(`Opening article with ID: ${newsId}`);
    }

    showToast(message, type = 'info') {
        // Create and show a toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
        `;

        const container = document.getElementById('toastContainer');
        if (container) {
            container.appendChild(toast);

            // Auto remove after 3 seconds
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
    }

    startAutoRefresh() {
        // Refresh breaking news every 5 minutes
        setInterval(() => {
            this.loadBreakingNews();
        }, 5 * 60 * 1000);
    }


}

// Initialize breaking news ticker immediately if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBreakingNews);
} else {
    // DOM is already ready
    initBreakingNews();
}

function initBreakingNews() {
    // Initialize immediately for fastest display
    window.breakingNewsTicker = new BreakingNewsTicker();
}

// Preload breaking news data as soon as script loads
(function preloadBreakingNews() {
    // Start fetching data immediately in the background
    const preloadPromise = fetch(`${API_BASE_URL}/news?limit=8&page=1&fields=_id,title,createdAt,category`, {
        headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
        }
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Preload failed');
    }).catch(error => {
        console.log('Preload attempt failed, will retry on init:', error.message);
    });

    // Store preload promise globally for the ticker to use
    window.breakingNewsPreload = preloadPromise;
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BreakingNewsTicker;
}

