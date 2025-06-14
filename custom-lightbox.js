// Check if lightbox elements exist on the page
function checkAndLoadGLightbox() {
  const lightboxElements = document.querySelectorAll('.lightbox');
  
  if (lightboxElements.length > 0) {
    loadGLightboxScript();
  }
}

// Function to dynamically load GLightbox CSS and JS
function loadGLightboxScript() {
  // Check if GLightbox is already loaded
  if (window.GLightbox) {
    initializeGLightbox();
    return;
  }
  
  // Load CSS first
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = 'https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css';
  document.head.appendChild(cssLink);
  
  // Load JavaScript
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/glightbox/dist/js/glightbox.min.js';
  script.onload = function() {
    initializeGLightbox();
  };
  script.onerror = function() {
    console.error('Failed to load GLightbox script');
  };
  
  document.head.appendChild(script);
}

// Initialize GLightbox after script loads
function initializeGLightbox() {
  if (window.GLightbox) {
    const lightbox = GLightbox({
      selector: '.lightbox',
      touchNavigation: true,
      loop: false,
      autoplayVideos: true
    });
    
    console.log('GLightbox initialized successfully');
  }
}

// Run the check when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndLoadGLightbox);
} else {
  checkAndLoadGLightbox();
}

// Optional: Re-check when new content is added dynamically
function recheckLightbox() {
  checkAndLoadGLightbox();
}

// Export the recheck function for manual use if needed
window.recheckLightbox = recheckLightbox;