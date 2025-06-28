// Start
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

  // Delegate click events manually for elements using data-popup-target
  document.querySelectorAll('.lightbox[data-popup-target]').forEach(el => {
    el.addEventListener('click', function (e) {
      e.preventDefault();

      const target = el.getAttribute('data-popup-target');
      const inlineElement = target && document.querySelector(target);

      if (inlineElement) {
        window.currentLightbox = GLightbox({
          elements: [
            {
              content: inlineElement.outerHTML,
              width: 'auto',
              height: 'auto'
            }
          ],
          touchNavigation: true,
          loop: false,
          autoplayVideos: true,
          closeButton: false,
          arrows: false,
          onClose: function() {
            window.currentLightbox = null;
          }
        });

        window.currentLightbox.open();
      } else {
        console.warn(`No inline content found for selector: ${target}`);
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
