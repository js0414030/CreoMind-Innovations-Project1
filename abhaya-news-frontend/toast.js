// Toast Notification System

/**
 * Shows a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast: 'success', 'error', or 'info'
 * @param {number} duration - Duration in milliseconds before the toast disappears
 */
function showToast(message, type = 'info', duration = 3000) {
    // Get the toast container or create it if it doesn't exist
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Create toast icon based on type
    const icon = document.createElement('div');
    icon.className = 'toast-icon';

    switch (type) {
        case 'success':
            icon.innerHTML = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'info':
        default:
            icon.innerHTML = '<i class="fas fa-info-circle"></i>';
            break;
    }

    // Create toast content
    const content = document.createElement('div');
    content.className = 'toast-content';
    content.textContent = message;

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Close notification');
    closeBtn.addEventListener('click', () => {
        removeToast(toast);
    });

    // Create progress bar
    const progressContainer = document.createElement('div');
    progressContainer.className = 'toast-progress';

    const progressBar = document.createElement('div');
    progressBar.className = 'toast-progress-bar';
    progressContainer.appendChild(progressBar);

    // Assemble toast
    toast.appendChild(icon);
    toast.appendChild(content);
    toast.appendChild(closeBtn);
    toast.appendChild(progressContainer);

    // Add toast to container
    container.appendChild(toast);

    // Animate progress bar
    progressBar.style.width = '100%';
    progressBar.style.transitionDuration = `${duration}ms`;

    // Start progress bar animation after a small delay to ensure CSS transition works
    setTimeout(() => {
        progressBar.style.width = '0%';
    }, 10);

    // Set timeout to remove toast
    const timeoutId = setTimeout(() => {
        removeToast(toast);
    }, duration);

    // Store the timeout ID on the toast element
    toast._timeoutId = timeoutId;

    // Pause progress bar animation on hover
    toast.addEventListener('mouseenter', () => {
        progressBar.style.transitionProperty = 'none';
        clearTimeout(toast._timeoutId);
    });

    // Resume progress bar animation on mouse leave
    toast.addEventListener('mouseleave', () => {
        const remainingTime = parseFloat(getComputedStyle(progressBar).width) /
            parseFloat(getComputedStyle(progressContainer).width) * duration;

        progressBar.style.transitionProperty = 'width';
        progressBar.style.transitionDuration = `${remainingTime}ms`;
        progressBar.style.width = '0%';

        toast._timeoutId = setTimeout(() => {
            removeToast(toast);
        }, remainingTime);
    });

    return toast;
}

/**
 * Removes a toast element with animation
 * @param {HTMLElement} toast - The toast element to remove
 */
function removeToast(toast) {
    // Clear any existing timeout
    if (toast._timeoutId) {
        clearTimeout(toast._timeoutId);
    }

    // Add fadeout animation
    toast.style.animation = 'fadeOut 0.3s forwards';

    // Remove from DOM after animation completes
    setTimeout(() => {
        if (toast.parentElement) {
            toast.parentElement.removeChild(toast);

            // If this was the last toast, remove the container too
            const container = document.getElementById('toastContainer');
            if (container && container.children.length === 0) {
                container.remove();
            }
        }
    }, 300);
}

// Shorthand functions for different toast types
export function showSuccessToast(message, duration = 3000) {
    return showToast(message, 'success', duration);
}

export function showErrorToast(message, duration = 5000) {
    return showToast(message, 'error', duration);
}

export function showInfoToast(message, duration = 3000) {
    return showToast(message, 'info', duration);
}