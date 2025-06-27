document.addEventListener('DOMContentLoaded', function() {
    // Event delegation with direct element targeting
    document.addEventListener('click', function(event) {
        // Target elements with track-event attribute
        const element = event.target.closest('[track-event]');
        
        if (!element) return; // Early return if no trackable element found
        
        // Get event name directly from clicked element
        const eventName = element.getAttribute('track-event');
        
        if (eventName) {
            event.preventDefault();
            
            // Improved URL parameter handling
            const urlParams = new URLSearchParams(window.location.search);
            const gclid = urlParams.get('gclid') || null;
            
            // Enhanced element data collection
            const elementData = {
                element_description: (element.innerText || element.textContent || '')
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, '_'),
            };
            
            // Add URL if element has href
            if (element.href) {
                elementData.element_url = element.href;
            }
            
            // Add optional parameters
            if (element.id) elementData.element_id = element.id;
            if (gclid) elementData.gclid = gclid;
            
            // Safe redirect function with error handling
            const handleRedirect = () => {
                // Only redirect if element has href
                if (element.href) {
                    try {
                        if (element.target === '_blank') {
                            window.open(element.href, '_blank', 'noopener,noreferrer');
                        } else {
                            window.location.href = element.href;
                        }
                    } catch (error) {
                        console.error('Redirect failed:', error);
                        // Fallback redirect
                        window.location.href = element.href;
                    }
                }
            };
            
            // Analytics handling with timeout safety
            if (typeof analytics !== 'undefined' && typeof analytics.track === 'function') {
                const analyticsTimeout = setTimeout(handleRedirect, 1000); // Failsafe timeout
                
                analytics.track(eventName, elementData, () => {
                    clearTimeout(analyticsTimeout);
                    handleRedirect();
                });
            } else {
                handleRedirect();
            }
        }
    });
});