(function(){
// Function to check if Segment analytics is properly working with retry mechanism
function isSegmentAnalyticsWorking(maxAttempts = 3, attemptDelay = 500, callback) {
    let currentAttempt = 1;
    
    function checkAnalytics() {
        try {
            if (typeof analytics === 'undefined') {
                retryOrFail();
                return;
            }
            
            if (typeof analytics.track !== 'function') {
                retryOrFail();
                return;
            }
            
            if (typeof analytics.initialize === 'function' && 
                typeof analytics.identify === 'function' && 
                typeof analytics.group === 'function' && 
                typeof analytics.page === 'function') {
                callback(true);
                return;
            }
            
            retryOrFail();
        } catch (e) {
            retryOrFail();
        }
    }
    
    function retryOrFail() {
        currentAttempt++;
        if (currentAttempt <= maxAttempts) {
            setTimeout(checkAnalytics, attemptDelay);
        } else {
            callback(false);
        }
    }
    
    checkAnalytics();
}

// Function to convert submit buttons to button elements
function convertSubmitButtonsToButtonElements() {
    const submitButtons = document.querySelectorAll('.email-form__button');
    const convertedButtons = [];

    Array.from(submitButtons).forEach(originalButton => {
        let button;
        
        if (originalButton.tagName.toLowerCase() !== 'button') {
            button = document.createElement('button');
            
            if (originalButton.className) {
                button.className = originalButton.className;
            }
            
            if (originalButton.hasAttribute('value')) {
                button.textContent = originalButton.value;
            } else {
                button.innerHTML = originalButton.innerHTML;
            }
            
            originalButton.parentNode.replaceChild(button, originalButton);
        } else {
            button = originalButton;
        }
        
        convertedButtons.push(button);
    });

    return convertedButtons;
}

// Function to get cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Function to collect metadata for context.traits
function collectMetadata(email) {
    const urlParams = new URLSearchParams(window.location.search);
    
    return {
        fullurl: window.location.href || null,
        utm_source: urlParams.get('utm_source') || null,
        utm_medium: urlParams.get('utm_medium') || null,
        utm_campaign: urlParams.get('utm_campaign') || null,
        utm_term: urlParams.get('utm_term') || null,
        utm_content: urlParams.get('utm_content') || null,
        utm_funnel: urlParams.get('utm_funnel') || null,
        fbc: getCookie('_fbc') || urlParams.get('fbclid') || null,
        fbp: getCookie('_fbp') || null,
        email: email || null,
        user_agent: navigator.userAgent || null,
        ip_address: null,
        userId: typeof analytics !== 'undefined' && analytics.user ? analytics.user().id() : null
    };
}

// Function to populate hidden input fields with metadata
function populateMetadataInputs(form, metadata) {
    const inputMappings = {
        'metadata-full-url': metadata.fullurl,
        'metadata-utm-source': metadata.utm_source,
        'metadata-utm-medium': metadata.utm_medium,
        'metadata-utm-campaign': metadata.utm_campaign,
        'metadata-utm-funnel': metadata.utm_funnel,
        'metadata-utm-term': metadata.utm_term,
        'metadata-utm-content': metadata.utm_content,
        'metadata-fbc': metadata.fbc,
        'metadata-fbp': metadata.fbp,
        'metadata-email': metadata.email,
        'metadata-user-agent': metadata.user_agent,
        'metadata-ip-address': metadata.ip_address,
        'metadata-user-id': metadata.userId
    };
    
    for (const [name, value] of Object.entries(inputMappings)) {
        const input = form.querySelector(`[name="${name}"]`);
        if (input && value !== null) {
            input.value = value;
        }
    }
}

// Function to submit form data to Webflow
function submitFormToWebflow(container, callback) {
    try {
        const form = container.tagName === 'FORM' ? container : container.querySelector('form');
        
        if (!form) {
            console.error('Form element not found');
            if (callback) callback();
            return;
        }
        
        const siteId = form.closest('[data-wf-site]')?.getAttribute('data-wf-site') || 
                       document.documentElement.getAttribute('data-wf-site');
        const pageId = form.getAttribute('data-wf-page-id');
        const elementId = form.getAttribute('data-wf-element-id');
        const formName = form.getAttribute('name') || form.getAttribute('data-name') || 'Email Form';
        
        if (!siteId || !pageId || !elementId) {
            console.error('Missing required form attributes (site ID, page ID, or element ID)');
            if (callback) callback();
            return;
        }
        
        const formData = new FormData(form);
        const params = new URLSearchParams();
        
        params.append('name', formName);
        params.append('pageId', pageId);
        params.append('elementId', elementId);
        params.append('domain', window.location.hostname);
        params.append('source', window.location.href);
        params.append('test', 'false');
        params.append('dolphin', 'false');
        
        formData.forEach((value, key) => {
            const input = form.querySelector(`[name="${key}"]`);
            const label = input?.getAttribute('data-name') || 
                         input?.previousElementSibling?.textContent || 
                         key;
            params.append(`fields[${label}]`, value);
        });
        
        fetch(`https://webflow.com/api/v1/form/${siteId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: params.toString(),
            mode: 'cors',
            credentials: 'omit'
        })
        .then(response => {
            if (!response.ok) {
                console.error('Form submission failed:', response.status);
            }
        })
        .catch(error => {
            console.error('Error submitting form to Webflow:', error);
        })
        .finally(() => {
            if (callback) callback();
        });
    } catch (error) {
        console.error('Error submitting form to Webflow:', error);
        if (callback) callback();
    }
}

// Main function to handle form submission and analytics tracking
document.addEventListener('DOMContentLoaded', function() {
    
    const submitButtons = document.querySelectorAll('.email-form__button');

    if (submitButtons.length === 0) {
        return;
    }

    const convertedButtons = convertSubmitButtonsToButtonElements();

    isSegmentAnalyticsWorking(3, 800, function(analyticsIsWorking) {

        if (analyticsIsWorking) {

            convertedButtons.forEach(button => {
                button.addEventListener("click", (e) => {
                    e.preventDefault();
                    
                    const el = button.closest('[email-form]') || button.closest('form');
                    
                    if (!el) {
                        return;
                    }
                    
                    const email = el.querySelector('[email-form__input]').value;
                    
                    const metadata = collectMetadata(email);
                    populateMetadataInputs(el, metadata);
                    
                    const secondaryEvent = el.getAttribute('data-secondary-event') || '';
                    
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
                    
                    const analyticsData = {
                        email: email,
                        sfdc_Lead_Source: customSfdc || window.global_sfdc_Lead_Source,
                    };
                    
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
                    
                    const analyticsOptions = {
                        integrations: {
                            Salesforce: true,
                        },
                        context: {
                            traits: metadata
                        }
                    };
                    
                    if (email) {
                        if (!disableEmailPosting) {
                            targetURL.searchParams.set('email', email);
                        }
                        
                        submitFormToWebflow(el, function() {
                            if (typeof analytics !== 'undefined' && typeof analytics.track === 'function') {
                                analytics.track(customEvent || window.global_analytics_track, analyticsData, analyticsOptions, function() {
                                    if (secondaryEvent) {
                                        analytics.track(secondaryEvent, analyticsData, analyticsOptions, function() {
                                            window.location = targetURL.toString();
                                        });
                                    } else {
                                        window.location = targetURL.toString();
                                    }
                                });
                            } else {
                                window.location = targetURL.toString();
                            }
                        });
                    } else {
                        if (separateRedirectionUrlWithoutEmail) {
                            const analyticsDataWithoutEmail = {
                                ...analyticsData
                            };
                            delete analyticsDataWithoutEmail.email;
                            
                            submitFormToWebflow(el, function() {
                                if (typeof analytics !== 'undefined' && typeof analytics.track === 'function') {
                                    analytics.track(customEvent || window.global_analytics_track, analyticsDataWithoutEmail, analyticsOptions, function() {
                                        window.location = separateRedirectionUrlWithoutEmail;
                                    });
                                } else {
                                    window.location = separateRedirectionUrlWithoutEmail;
                                }
                            });
                        } else {
                            submitFormToWebflow(el, function() {
                                window.location = targetURL.toString();
                            });
                        }
                    }
                });
            });
        }
    });
});
})();