function initializeSetColorVariables() {
  const elementsWithCustomColors = document.querySelectorAll('[custom-color]');
  
  elementsWithCustomColors.forEach((element) => {
    // Check all attributes of the element
    Array.from(element.attributes).forEach((attr) => {
      // If attribute name starts with 'custom-color-'
      if (attr.name.startsWith('custom-color-') && attr.value && attr.value.trim() !== '') {
        // Set CSS variable with the same name
        element.style.setProperty(`--${attr.name}`, attr.value);
      }
    });
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