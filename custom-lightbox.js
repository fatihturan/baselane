// Check if there any .lightbox element exist first
function checkAndLoadGLightbox() {
  const lightboxElements = document.querySelectorAll('.lightbox');

  if (lightboxElements.length > 0) {
    loadGLightboxScript();
  }
}

function loadGLightboxScript() {
  if (window.GLightbox) {
    initializeGLightbox();
    return;
  }

  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = 'https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css';
  document.head.appendChild(cssLink);

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/glightbox/dist/js/glightbox.min.js';
  script.onload = function () {
    initializeGLightbox();
  };
  script.onerror = function () {
    console.error('Failed to load GLightbox script');
  };

  document.head.appendChild(script);
}

function initializeGLightbox() {
  if (!window.GLightbox) return;

  window.currentLightbox = null;

  // Global event delegation for close buttons
  document.addEventListener('click', function(e) {
    // Check if clicked element is a close button
    if (e.target.closest('[icon-button]') || e.target.closest('.popup__close-button') || e.target.closest('.icon-button')) {
      // Check if we're inside a glightbox
      if (e.target.closest('.glightbox-container')) {
        e.preventDefault();
        if (currentLightbox) {
          currentLightbox.close();
        }
      }
    }
  });

  // Handle ALL .lightbox elements
  document.querySelectorAll('.lightbox').forEach(el => {
    el.addEventListener('click', function (e) {
      e.preventDefault();

      const popupTarget = el.getAttribute('data-popup-target');
      
      // If data-popup-target exists, use inline content
      if (popupTarget) {
        const inlineElement = document.querySelector(popupTarget);

        if (inlineElement) {
          // Close any existing lightbox first
          if (window.currentLightbox) {
            window.currentLightbox.close();
          }

          // Create a completely new GLightbox instance for this specific popup only
          window.currentLightbox = GLightbox({
            selector: false, // Disable automatic selector scanning to prevent grouping
            loop: false,
            autoplayVideos: true,
            closeButton: false,
            arrows: false,
            draggable: false,
            onClose: function() {
              window.currentLightbox = null;
            }
          });

          // Set elements with only this specific content
          window.currentLightbox.setElements([{
            content: inlineElement.outerHTML,
            width: 'auto',
            height: 'auto'
          }]);

          // Open the lightbox
          window.currentLightbox.open();
        } else {
          console.warn(`No inline content found for selector: ${popupTarget}`);
        }
      } else {
        // If no data-popup-target, use href attribute
        const href = el.getAttribute('href');
        
        if (href) {
          // Close any existing lightbox first
          if (window.currentLightbox) {
            window.currentLightbox.close();
          }

          // Create GLightbox instance for href content
          window.currentLightbox = GLightbox({
            selector: false,
            loop: false,
            autoplayVideos: true,
            closeButton: false,
            arrows: false,
            draggable: false,
            onClose: function() {
              window.currentLightbox = null;
            }
          });

          // Determine content type based on href
          let contentConfig = {
            href: href,
            width: 'auto',
            height: 'auto'
          };

          // Check if it's an image
          if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(href)) {
            contentConfig.type = 'image';
          }
          // Check if it's a video
          else if (/\.(mp4|webm|ogg)$/i.test(href)) {
            contentConfig.type = 'video';
          }
          // Check if it's a YouTube or Vimeo link
          else if (/youtube\.com|youtu\.be|vimeo\.com/i.test(href)) {
            contentConfig.type = 'video';
          }
          // Default to iframe for other links
          else {
            contentConfig.type = 'iframe';
          }

          // Set elements with href content
          window.currentLightbox.setElements([contentConfig]);

          // Open the lightbox
          window.currentLightbox.open();
        } else {
          console.warn('No href attribute found on lightbox element');
        }
      }
    });
  });
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

window.recheckLightbox = recheckLightbox;

// Global function to close lightbox
function closeCurrentLightbox() {
  if (window.currentLightbox) {
    window.currentLightbox.close();
  }
}

window.closeCurrentLightbox = closeCurrentLightbox;