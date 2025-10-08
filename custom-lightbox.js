function checkAndLoadGLightbox() {
  const lightboxElements = document.querySelectorAll('.lightbox');
  const autoOpenPopups = document.querySelectorAll('[popup][auto-open="true"]');

  if (lightboxElements.length > 0 || autoOpenPopups.length > 0) {
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

function reinitializeWebflowIfFormExists() {
  setTimeout(function() {
    const glightboxContainer = document.querySelector('.glightbox-container');
    if (glightboxContainer) {
      const formInPopup = glightboxContainer.querySelector('form');
      if (formInPopup && typeof Webflow !== 'undefined') {
        Webflow.destroy();
        Webflow.ready();
      }
    }
  }, 100);
}

function initializeGLightbox() {
  if (!window.GLightbox) return;

  window.currentLightbox = null;

  document.addEventListener('click', function(e) {
    if (e.target.closest('[icon-button]') || e.target.closest('.popup__close-button') || e.target.closest('.icon-button')) {
      if (e.target.closest('.glightbox-container')) {
        e.preventDefault();
        if (currentLightbox) {
          currentLightbox.close();
        }
      }
    }
  });

  document.querySelectorAll('.lightbox').forEach(el => {
    el.addEventListener('click', function (e) {
      e.preventDefault();

      const popupTarget = el.getAttribute('data-popup-target');
      
      if (popupTarget) {
        const inlineElement = document.querySelector(popupTarget);

        if (inlineElement) {
          if (window.currentLightbox) {
            window.currentLightbox.close();
          }

          window.currentLightbox = GLightbox({
            selector: false,
            loop: false,
            autoplayVideos: true,
            closeButton: false,
            arrows: false,
            draggable: false,
            onOpen: function() {
              reinitializeWebflowIfFormExists();
            },
            onClose: function() {
              window.currentLightbox = null;
            }
          });

          window.currentLightbox.setElements([{
            content: inlineElement.outerHTML,
            width: 'auto',
            height: 'auto'
          }]);

          window.currentLightbox.open();
        } else {
          console.warn(`No inline content found for selector: ${popupTarget}`);
        }
      } else {
        const href = el.getAttribute('href');
        
        if (href) {
          if (window.currentLightbox) {
            window.currentLightbox.close();
          }

          window.currentLightbox = GLightbox({
            selector: false,
            loop: false,
            autoplayVideos: true,
            arrows: false,
            draggable: false,
            onOpen: function() {
              reinitializeWebflowIfFormExists();
            },
            onClose: function() {
              window.currentLightbox = null;
            }
          });

          let contentConfig = {
            href: href,
            width: 'auto',
            height: 'auto'
          };

          if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(href)) {
            contentConfig.type = 'image';
          }
          else if (/\.(mp4|webm|ogg)$/i.test(href)) {
            contentConfig.type = 'video';
          }
          else if (/youtube\.com|youtu\.be|vimeo\.com/i.test(href)) {
            contentConfig.type = 'video';
          }
          else {
            contentConfig.type = 'iframe';
          }

          window.currentLightbox.setElements([contentConfig]);
          window.currentLightbox.open();
        } else {
          console.warn('No href attribute found on lightbox element');
        }
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    checkAndLoadGLightbox();
    initializeAutoOpenPopups();
  });
} else {
  checkAndLoadGLightbox();
  initializeAutoOpenPopups();
}

function recheckLightbox() {
  checkAndLoadGLightbox();
}

window.recheckLightbox = recheckLightbox;

function closeCurrentLightbox() {
  if (window.currentLightbox) {
    window.currentLightbox.close();
  }
}

window.closeCurrentLightbox = closeCurrentLightbox;

function checkAndInitAutoOpenPopups() {
  const autoOpenPopups = document.querySelectorAll('[popup][auto-open="true"]');

  autoOpenPopups.forEach(popup => {
    const timeoutValue = popup.getAttribute('auto-open-timeout');
    const timeout = timeoutValue ? parseInt(timeoutValue, 10) : 0;
    const autoOpenUntilClicked = popup.getAttribute('auto-open-until-clicked');
    const autoOpenForFirstTime = popup.getAttribute('auto-open-for-first-time-users');

    if (autoOpenForFirstTime === 'true') {
      const expiryDays = popup.getAttribute('first-time-use-expiry');
      const expiryValue = expiryDays ? parseInt(expiryDays, 10) : 0;

      const visitData = localStorage.getItem('popup-site-visited');

      if (visitData) {
        if (expiryValue > 0) {
          try {
            const visitInfo = JSON.parse(visitData);
            const visitDate = new Date(visitInfo.timestamp);
            const currentDate = new Date();
            const daysDifference = Math.floor((currentDate - visitDate) / (1000 * 60 * 60 * 24));

            if (daysDifference >= expiryValue) {
              localStorage.removeItem('popup-site-visited');
            } else {
              return;
            }
          } catch (e) {
            localStorage.removeItem('popup-site-visited');
          }
        } else {
          return;
        }
      }

      const visitInfo = {
        timestamp: new Date().toISOString(),
        visited: true
      };
      localStorage.setItem('popup-site-visited', JSON.stringify(visitInfo));
    }

    if (autoOpenUntilClicked) {
      const elementsToWatch = document.querySelectorAll(autoOpenUntilClicked);
      elementsToWatch.forEach(element => {
        element.addEventListener('click', function() {
          popup.setAttribute('data-clicked', 'true');
        });
      });
    }

    if (timeout > 0) {
      setTimeout(() => {
        if (window.currentLightbox) {
          return;
        }

        if (popup.getAttribute('data-clicked') === 'true') {
          return;
        }

        const popupWrapper = popup.querySelector('[popup__wrapper]');
        if (popupWrapper) {
          const popupContent = popupWrapper.outerHTML;

          if (window.currentLightbox) {
            window.currentLightbox.close();
          }

          window.currentLightbox = GLightbox({
            selector: false,
            loop: false,
            autoplayVideos: true,
            closeButton: false,
            arrows: false,
            draggable: false,
            onOpen: function() {
              reinitializeWebflowIfFormExists();
            },
            onClose: function() {
              window.currentLightbox = null;
            }
          });

          window.currentLightbox.setElements([{
            content: popupContent,
            width: 'auto',
            height: 'auto'
          }]);

          window.currentLightbox.open();
        }
      }, timeout);
    }
  });
}

function initializeAutoOpenPopups() {
  if (window.GLightbox) {
    checkAndInitAutoOpenPopups();
  } else {
    setTimeout(initializeAutoOpenPopups, 100);
  }
}