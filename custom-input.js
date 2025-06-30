document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[input]').forEach(wrapper => {
    const placeholderText = wrapper.getAttribute('placeholder-text');
    const requireAttribute = wrapper.getAttribute('require');
    const field = wrapper.querySelector('[input__field]');
    
    if (field) {
      if (placeholderText && placeholderText.trim() !== '') {
        field.setAttribute('placeholder', placeholderText);
      }
      
      if (requireAttribute === 'true') {
        field.setAttribute('required', '');
      }
    }
  });
});