function initializeSetColorVariables() {
  const elementsWithColors = document.querySelectorAll('[primary-color], [secondary-color]');
  
  elementsWithColors.forEach((element, index) => {
    const primaryColor = element.getAttribute('primary-color');
    const secondaryColor = element.getAttribute('secondary-color');
    
    // Handle primary color
    if (primaryColor && primaryColor.trim() !== '') {
      element.style.setProperty('--primary-color', primaryColor);
    }
    
    // Handle secondary color as CSS variable
    if (secondaryColor && secondaryColor.trim() !== '') {
      element.style.setProperty('--secondary-color', secondaryColor);
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSetColorVariables);
} else {
  initializeSetColorVariables();
}

// Also run on window load as backup
window.addEventListener('load', initializeSetColorVariables);