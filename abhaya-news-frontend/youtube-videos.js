// API Base URL - Use relative path for proxy to work
// const API_BASE_URL = '/api';

// DOM Elements
const youtubeVideosGrid = document.getElementById('youtubeVideosGrid');
const loadMoreVideosBtn = document.getElementById('loadMoreVideos');
const youtubeVideoModal = document.getElementById('youtubeVideoModal');
const youtubeVideoContainer = document.getElementById('youtubeVideoContainer');
const closeYoutubeModal = document.getElementById('closeYoutubeModal');

// State variables
let currentVideoPage = 1;
let totalVideoPages = 1;
const videosPerPage = 6;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load initial videos
    fetchYoutubeVideos();

    // Load more videos button
    if (loadMoreVideosBtn) {
        loadMoreVideosBtn.addEventListener('click', () => {
            if (currentVideoPage < totalVideoPages) {
                currentVideoPage++;
                fetchYoutubeVideos(true); // append = true
            } else {
                loadMoreVideosBtn.textContent = 'No More Videos';
                loadMoreVideosBtn.disabled = true;

                // Reset after 3 seconds
                setTimeout(() => {
                    loadMoreVideosBtn.textContent = 'Load More Videos';
                    loadMoreVideosBtn.disabled = false;
                }, 3000);
            }
        });
    }

    // Close YouTube modal
    if (closeYoutubeModal) {
        closeYoutubeModal.addEventListener('click', () => {
            closeYoutubeVideoModal();
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === youtubeVideoModal) {
            closeYoutubeVideoModal();
        }
    });
});

// Fetch YouTube Videos
async function fetchYoutubeVideos(append = false) {
    if (!youtubeVideosGrid) return;

    if (!append) {
        youtubeVideosGrid.innerHTML = '<div class="loading">Loading videos...</div>';
    }

    try {
        const response = await fetch(`${API_BASE_URL}/youtube?page=${currentVideoPage}&limit=${videosPerPage}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Update pagination state
        totalVideoPages = data.totalPages || 1;

        // Update load more button
        if (loadMoreVideosBtn) {
            if (currentVideoPage >= totalVideoPages) {
                loadMoreVideosBtn.textContent = 'No More Videos';
                loadMoreVideosBtn.disabled = true;
            } else {
                loadMoreVideosBtn.textContent = 'Load More Videos';
                loadMoreVideosBtn.disabled = false;
            }
        }

        // Display videos
        displayYoutubeVideos(data.videos || [], append);

    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        // if (!append) {
        youtubeVideosGrid.innerHTML = '<div class="loading">Failed to load videos. Please try again later.</div>';
        // } else {
        // Show error toast if appending failed
        //     if (typeof showErrorToast === 'function') {
        //         showErrorToast('Failed to load more videos. Please try again.');
        //     }
        // }
    }
}

// Display YouTube Videos
function displayYoutubeVideos(videos, append = false) {
    if (!youtubeVideosGrid) return;

    if (videos.length === 0 && !append) {
        youtubeVideosGrid.innerHTML = '<div class="loading">No videos found</div>';
        return;
    }

    // If not appending, clear the grid
    if (!append) {
        youtubeVideosGrid.innerHTML = '';
    }

    // Create HTML for each video
    videos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'youtube-video-card';

        // const videoId = extractYoutubeVideoId(video.videoUrl);
        // videoCard.dataset.videoUrl = video.videoUrl;
        const videoId = extractYoutubeVideoId(video.link);
        videoCard.dataset.videoUrl = video.link;

        videoCard.dataset.videoId = videoId;

        const date = new Date(video.createdAt).toLocaleDateString();
        const thumbnailUrl = video.thumbnailUrl ||
            (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` :
                'https://via.placeholder.com/320x180?text=No+Thumbnail');

        videoCard.innerHTML = `
            <div class="youtube-video-thumbnail">
                <img src="${thumbnailUrl}" alt="${video.title}">
                <div class="youtube-video-play-button">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <div class="youtube-video-content">
                <span class="youtube-video-category">${video.category}</span>
                <h3 class="youtube-video-title">${video.title}</h3>
                <span class="youtube-video-date">${date}</span>
            </div>
        `;

        // Add click event to open video
        videoCard.addEventListener('click', () => {
            openYoutubeVideoModal(video);
        });

        youtubeVideosGrid.appendChild(videoCard);
    });

    // If no videos were added and the grid is empty, show a message
    if (youtubeVideosGrid.children.length === 0) {
        youtubeVideosGrid.innerHTML = '<div class="loading">No videos found</div>';
    }
}

// Open YouTube Video Modal
function openYoutubeVideoModal(video) {
    if (!youtubeVideoModal || !youtubeVideoContainer) return;

    // const videoId = extractYoutubeVideoId(video.videoUrl);
    const videoId = extractYoutubeVideoId(video.link);
    console.log('Opening video modal for ID:', videoId); // DEBUG


    if (!videoId) {
        if (typeof showErrorToast === 'function') {
            showErrorToast('Invalid YouTube video URL');
        } else {
            alert('Invalid YouTube video URL');
        }
        return;
    }

    // Create iframe for YouTube video
    youtubeVideoContainer.innerHTML = `
        <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
            title="${video.title}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;

    // Show modal
    // youtubeVideoModal.style.display = 'block';
    youtubeVideoModal.style.display = 'flex';


    // Prevent scrolling on body
    document.body.style.overflow = 'hidden';
}

// Close YouTube Video Modal
function closeYoutubeVideoModal() {
    if (!youtubeVideoModal || !youtubeVideoContainer) return;

    // Clear iframe to stop video
    youtubeVideoContainer.innerHTML = '';

    // Hide modal
    youtubeVideoModal.style.display = 'none';

    // Re-enable scrolling
    document.body.style.overflow = '';
}

// Helper function to extract YouTube video ID
function extractYoutubeVideoId(url) {
    if (!url) return null;

    // Regular expressions to match different YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11) ? match[2] : null;
}