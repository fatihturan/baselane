// Function to check if Segment analytics is properly working with retry mechanism
function isSegmentAnalyticsWorking(maxAttempts = 3, attemptDelay = 500, callback) {
    // console.log(`DEBUG: Checking if Segment analytics is working (attempt 1/${maxAttempts})`);
    
    let currentAttempt = 1;
    
    function checkAnalytics() {
        try {
            // Basic check if analytics object exists
            if (typeof analytics === 'undefined') {
                // console.log(`DEBUG: Attempt ${currentAttempt}/${maxAttempts} - analytics object is undefined`);
                retryOrFail();
                return;
            }
            
            // console.log(`DEBUG: Attempt ${currentAttempt}/${maxAttempts} - analytics object exists`);
            
            // Check for track method specifically
            if (typeof analytics.track !== 'function') {
                // console.log(`DEBUG: Attempt ${currentAttempt}/${maxAttempts} - analytics.track is not a function`);
                retryOrFail();
                return;
            }
            
            // console.log(`DEBUG: Attempt ${currentAttempt}/${maxAttempts} - analytics.track is a function`);
            
            // Additional check for Segment specific properties
            // This is more likely to detect a stub/fake analytics object
            if (typeof analytics.initialize === 'function' && 
                typeof analytics.identify === 'function' && 
                typeof analytics.group === 'function' && 
                typeof analytics.page === 'function') {
                // console.log(`DEBUG: Attempt ${currentAttempt}/${maxAttempts} - All critical Segment methods exist`);
                callback(true);
                return;
            }
            
            // console.log(`DEBUG: Attempt ${currentAttempt}/${maxAttempts} - Missing some critical Segment methods`);
            retryOrFail();
        } catch (e) {
            // console.error(`DEBUG: Attempt ${currentAttempt}/${maxAttempts} - Error checking analytics:`, e);
            retryOrFail();
        }
    }
    
    function retryOrFail() {
        currentAttempt++;
        if (currentAttempt <= maxAttempts) {
            // console.log(`DEBUG: Retrying analytics check in ${attemptDelay}ms (attempt ${currentAttempt}/${maxAttempts})`);
            setTimeout(checkAnalytics, attemptDelay);
        } else {
            // console.log(`DEBUG: All ${maxAttempts} attempts failed, analytics is not working`);
            callback(false);
        }
    }
    
    // Start the first check
    checkAnalytics();
}

// Function to convert submit buttons to button elements
function convertSubmitButtonsToButtonElements() {
    const submitButtons = document.querySelectorAll('.email-form__button');
    const convertedButtons = [];

    // Convert NodeList to Array to avoid issues with live collections when replacing elements
    Array.from(submitButtons).forEach(originalButton => {
        let button;
        
        // Replace the element with a button element if it's not already a button
        if (originalButton.tagName.toLowerCase() !== 'button') {
            button = document.createElement('button');
            
            // Only copy class attribute from original element
            if (originalButton.className) {
                button.className = originalButton.className;
            }
            
            // Use the value attribute as button text if it exists, otherwise copy the inner HTML
            if (originalButton.hasAttribute('value')) {
                button.textContent = originalButton.value;
            } else {
                button.innerHTML = originalButton.innerHTML;
            }
            
            // Replace the original element with the new button
            originalButton.parentNode.replaceChild(button, originalButton);
        } else {
            button = originalButton;
        }
        
        convertedButtons.push(button);
    });

    return convertedButtons;
}

// Main function to handle form submission and analytics tracking
document.addEventListener('DOMContentLoaded', function() {
    
    const submitButtons = document.querySelectorAll('.email-form__button');

    // Check if there are any submit buttons on the page
    if (submitButtons.length === 0) {
        // console.log("DEBUG: No .email-form__button elements found on the page");
        return;
    }

    // console.log(`DEBUG: Found ${submitButtons.length} .email-form__button elements`);

    // Convert all submit buttons to button elements regardless of analytics status
    const convertedButtons = convertSubmitButtonsToButtonElements();
    // console.log("DEBUG: Submit buttons converted to button elements");

    // Check if the analytics object is defined and has the track method
    isSegmentAnalyticsWorking(3, 800, function(analyticsIsWorking) {
        // console.log("DEBUG: Final analytics status:", analyticsIsWorking);

        if (analyticsIsWorking) {
            // console.log("DEBUG: Analytics is working, proceeding with analytics-dependent code");

            // Add event listeners to converted buttons
            convertedButtons.forEach(button => {
                // Add click event listener to the button
                button.addEventListener("click", (e) => {
                    e.preventDefault();
                    // console.log("Debug: Form Submit Started");
                    
                    // Read form values when the button is clicked
                    const el = button.closest('[email-form]') || button.closest('form');
                    
                    if (!el) {
                        // console.error("Form not found!");
                        return;
                    }
                    
                    // Reading the form values from here
                    const email = el.querySelector('[email-form__input]').value;
                    const secondaryEvent = el.getAttribute('data-secondary-event') || '';
                    
                    // Check if attributes exist and have value "true"
                    const disableEmailPosting = el.getAttribute('data-disable-email-posting') === 'true';
                    const disableURLQueryParamsCarrying = el.getAttribute('data-disable-url-query-parameter-carrying') === 'true';
                    const enableSendingUtm = el.getAttribute('data-enable-sending-utm') === 'true';
                    
                    const redirectURL = el.getAttribute('data-redirect-url') || '';
                    const customEvent = el.getAttribute('data-custom-event') || '';
                    const customSfdc = el.getAttribute('data-custom-sfdc') || '';
                    const separateRedirectionUrlWithoutEmail = el.getAttribute('data-separate-redirection-url-without-email') || '';
                    
                    let URLQueryParams = window.location.search;
                    if (URLQueryParams.startsWith('?')) {
                        URLQueryParams = URLQueryParams.slice(1);
                    }
                    
                    const gclid = URLQueryParams.includes('gclid') ? new URLSearchParams(URLQueryParams).get('gclid') : '';
                    const utmSource = URLQueryParams.includes('utm_source') ? new URLSearchParams(URLQueryParams).get('utm_source') : null;
                    const utmMedium = URLQueryParams.includes('utm_medium') ? new URLSearchParams(URLQueryParams).get('utm_medium') : null;
                    const utmCampaign = URLQueryParams.includes('utm_campaign') ? new URLSearchParams(URLQueryParams).get('utm_campaign') : null;
                    
                    // Analytics data
                    const analyticsData = {
                        email: email,
                        sfdc_Lead_Source: customSfdc || window.global_sfdc_Lead_Source,
                    };
                    
                    // Check for additional props from global variable
                    const additionalPropsVar = el.getAttribute('data-additional-props');
                    if (additionalPropsVar && window[additionalPropsVar] && typeof window[additionalPropsVar] === 'object') {
                        Object.assign(analyticsData, window[additionalPropsVar]);
                    }
                    
                    if (gclid) {
                        analyticsData.gclid = gclid;
                    }
                    
                    if (enableSendingUtm) {
                        if (utmSource)
                            analyticsData.utmSource = utmSource;
                        if (utmMedium)
                            analyticsData.utmMedium = utmMedium;
                        if (utmCampaign)
                            analyticsData.utmCampaign = utmCampaign;
                    }
                    
                    // Creating the target URL
                    let targetURL;
                    if (redirectURL) {
                        targetURL = new URL(redirectURL);
                        
                        if (!disableURLQueryParamsCarrying) {
                            const params = new URLSearchParams(window.location.search);
                            params.forEach((value, key) => {
                                targetURL.searchParams.set(key, value);
                            });
                        }
                    } else {
                        if (disableURLQueryParamsCarrying) {
                            targetURL = new URL('https://app.baselane.com/signup/?ref=brand');
                        } else {
                            targetURL = new URL('https://app.baselane.com/signup/?ref=brand' + (URLQueryParams ? '&' + decodeURIComponent(URLQueryParams) : ''));
                        }
                    }
                    
                    if (gclid) {
                        targetURL.searchParams.set('gclid', gclid);
                    }
                    
                    // Perform operations if email exists
                    if (email) {
                        if (!disableEmailPosting) {
                            targetURL.searchParams.set('email', email);
                        }
                        
                        if (typeof analytics !== 'undefined' && typeof analytics.track === 'function') {
                            analytics.track(customEvent || window.global_analytics_track, analyticsData, {
                                integrations: {
                                    Salesforce: true,
                                },
                            }, function() {
                                if (secondaryEvent) {
                                    analytics.track(secondaryEvent, analyticsData, {
                                        integrations: {
                                            Salesforce: true,
                                        },
                                    }, function() {
                                        window.location = targetURL.toString();
                                    });
                                } else {
                                    window.location = targetURL.toString();
                                }
                            });
                        } else {
                            window.location = targetURL.toString();
                        }
                    } else {
                        // If email doesn't exist
                        if (separateRedirectionUrlWithoutEmail) {
                            const analyticsDataWithoutEmail = {
                                ...analyticsData
                            };
                            delete analyticsDataWithoutEmail.email;
                            
                            if (typeof analytics !== 'undefined' && typeof analytics.track === 'function') {
                                analytics.track(customEvent || window.global_analytics_track, analyticsDataWithoutEmail, {
                                    integrations: {
                                        Salesforce: true,
                                    },
                                }, function() {
                                    window.location = separateRedirectionUrlWithoutEmail;
                                });
                            } else {
                                window.location = separateRedirectionUrlWithoutEmail;
                            }
                        } else {
                            window.location = targetURL.toString();
                        }
                    }
                });
            });
        } else {
            // console.log("DEBUG: Analytics is not working, buttons converted but no event listeners added");
        }
    });
});