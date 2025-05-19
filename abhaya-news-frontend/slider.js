document.addEventListener('DOMContentLoaded', function() {
    // Banner Slider Functionality
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    let currentSlide = 0;
    let slideInterval;

    // Initialize the slider
    function initSlider() {
        // Hide all slides
        slides.forEach(slide => {
            slide.style.display = 'none';
        });

        // Show the current slide
        slides[currentSlide].style.display = 'block';

        // Update dots
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        dots[currentSlide].classList.add('active');

        // Start auto-sliding
        startSlideInterval();
    }

    // Go to a specific slide
    function goToSlide(index) {
        // Reset interval when manually changing slides
        resetSlideInterval();

        // Hide current slide
        slides[currentSlide].style.display = 'none';
        dots[currentSlide].classList.remove('active');

        // Update current slide index
        currentSlide = index;

        // If index is out of bounds, reset to first or last slide
        if (currentSlide < 0) {
            currentSlide = slides.length - 1;
        } else if (currentSlide >= slides.length) {
            currentSlide = 0;
        }

        // Show new current slide
        slides[currentSlide].style.display = 'block';
        dots[currentSlide].classList.add('active');
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
        slideInterval = setInterval(() => {
            nextSlide();
        }, 5000); // Change slide every 5 seconds
    }

    // Reset interval
    function resetSlideInterval() {
        clearInterval(slideInterval);
        startSlideInterval();
    }

    // Event listeners
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // Dot navigation
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const slideIndex = parseInt(dot.dataset.index);
            goToSlide(slideIndex);
        });
    });

    // Initialize the slider
    initSlider();

    // Pause auto-sliding when hovering over the slider
    const sliderContainer = document.querySelector('.slider-container');
    sliderContainer.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });

    sliderContainer.addEventListener('mouseleave', () => {
        startSlideInterval();
    });

    // The view-all links now directly link to category pages, so we don't need this JavaScript
    // We're keeping this comment to explain the change

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

    // Trending cards are now handled in the category.js file for category pages
    // For the home page, we'll handle them here
    if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
        const trendingCards = document.querySelectorAll('.trending-card');
        trendingCards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.querySelector('h3').textContent;
                const category = card.querySelector('.news-category').textContent;
                alert(`${category.toUpperCase()} NEWS: ${title}\n\nThis would open the full article in a real application.`);
            });
        });
    }

    // Category cards are now handled in the category.js file for category pages
    // and in the inline script in index.html for the home page
});