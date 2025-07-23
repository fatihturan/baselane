// Main class for tracking UTM parameters
class UTMTracker {
    constructor(options = {}) {
        this.cookieName = 'userAttributionTracking';
        this.domain = options.domain || window.location.hostname;
        this.debug = options.debug || false;
        
        this.log('UTMTracker initialized:', { 
            cookieName: this.cookieName, 
            domain: this.domain,
            debug: this.debug 
        });
    }

    // Console log wrapper for debug mode
    log(...args) {
        if (this.debug) {
            // console.log(...args);
        }
    }

    // Get all UTM parameters from current URL
    getUTMParameters() {
        const fullUrl = window.location.href;
        this.log('Full URL:', fullUrl);
        
        const searchString = window.location.search;
        this.log('Search string:', searchString);
        
        const urlParams = new URLSearchParams(searchString);
        this.log('All URL parameters:');
        for (const [key, value] of urlParams.entries()) {
            this.log(`${key}: ${value}`);
        }

        const params = {
            utm_source: urlParams.get('utm_source') || null,
            utm_campaign: urlParams.get('utm_campaign') || null,
            utm_medium: urlParams.get('utm_medium') || null,
            utm_term: urlParams.get('utm_term') || null,
            utm_content: urlParams.get('utm_content') || null,
            utm_funnel: urlParams.get('utm_funnel') || null,
            utm_id: urlParams.get('utm_id') || null,
            gclid: urlParams.get('gclid') || null,
            timestamp: new Date().toISOString()
        };
        
        // Log parameter details for debugging
        this.log('Parameter type check:', {
            source_type: typeof params.utm_source,
            source_value: params.utm_source,
            campaign_type: typeof params.utm_campaign,
            campaign_value: params.utm_campaign
        });

        Object.entries(params).forEach(([key, value]) => {
            this.log(`${key} parameter value:`, value);
        });

        const hasUtmParams = Object.entries(params)
            .filter(([key]) => key !== 'timestamp')
            .some(([key, value]) => value !== null && value !== '');
            
        this.log('Has UTM parameters:', hasUtmParams);
        this.log('Final UTM parameters:', params);
        
        return params;
    }

    // Get current cookie value if exists
    getCurrentCookie() {
        const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(this.cookieName + '='));
        
        if (cookie) {
            try {
                const parsedCookie = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
                this.log('Existing cookie found:', parsedCookie);
                return parsedCookie;
            } catch (e) {
                console.error('Error parsing cookie:', e);
                return null;
            }
        }
        this.log('No existing cookie found');
        return null;
    }

    // Save data to cookie
    setCookie(value) {
        try {
            const cookieValue = encodeURIComponent(JSON.stringify(value));
            const cookieString = `${this.cookieName}=${cookieValue}; path=/; domain=${this.domain}; max-age=31536000; SameSite=Lax`;
            document.cookie = cookieString;
            this.log('Cookie set with value:', value);
            this.log('Cookie string:', cookieString);
            return true;
        } catch (e) {
            console.error('Error setting cookie:', e);
            return false;
        }
    }

    // Format UTM data with ft (first touch) or lt (last touch) prefix
    formatUTMData(params, prefix) {
        this.log('Incoming params to format:', params);
        
        const formattedData = {
            [`utm_source_${prefix}`]: params.utm_source === null ? null : String(params.utm_source),
            [`utm_campaign_${prefix}`]: params.utm_campaign === null ? null : String(params.utm_campaign),
            [`utm_medium_${prefix}`]: params.utm_medium === null ? null : String(params.utm_medium),
            [`utm_term_${prefix}`]: params.utm_term === null ? null : String(params.utm_term),
            [`utm_content_${prefix}`]: params.utm_content === null ? null : String(params.utm_content),
            [`utm_funnel_${prefix}`]: params.utm_funnel === null ? null : String(params.utm_funnel),
            [`utm_id_${prefix}`]: params.utm_id === null ? null : String(params.utm_id),
            [`gclid_${prefix}`]: params.gclid === null ? null : String(params.gclid),
            [`timestamp_${prefix}`]: params.timestamp
        };
        
        this.log(`Formatted UTM data for ${prefix}:`, formattedData);
        this.log('Formatted data type check:', {
            source: typeof formattedData[`utm_source_${prefix}`],
            campaign: typeof formattedData[`utm_campaign_${prefix}`]
        });
        
        return formattedData;
    }

    // Create empty tracking data object
    createEmptyTrackingData() {
        const timestamp = new Date().toISOString();
        const emptyData = {
            utm_source: null,
            utm_campaign: null,
            utm_medium: null,
            utm_term: null,
            utm_content: null,
            utm_funnel: null,
            utm_id: null,
            gclid: null,
            timestamp: timestamp
        };

        return {
            first_touch: this.formatUTMData(emptyData, 'ft'),
            last_touch: this.formatUTMData(emptyData, 'lt')
        };
    }

    // Main tracking function
    track(forceCreate = false) {
        this.log('Starting UTM tracking');
        const utmParams = this.getUTMParameters();
        const currentCookie = this.getCurrentCookie();

        // Check if there are any UTM parameters
        const hasUtmParams = Object.entries(utmParams)
            .filter(([key]) => key !== 'timestamp')
            .some(([key, value]) => value !== null && value !== '');

        let newCookieValue;

        // If UTM parameters exist, process them
        if (hasUtmParams) {
            this.log('Valid UTM parameters found, proceeding with tracking');

            if (!currentCookie) {
                this.log('First visit with UTM parameters, setting both first_touch and last_touch');
                newCookieValue = {
                    first_touch: this.formatUTMData(utmParams, 'ft'),
                    last_touch: this.formatUTMData(utmParams, 'lt')
                };
            } else {
                this.log('Repeat visit with UTM parameters, updating last_touch only');
                newCookieValue = {
                    first_touch: currentCookie.first_touch,
                    last_touch: this.formatUTMData(utmParams, 'lt')
                };
            }

            this.setCookie(newCookieValue);
            this.log('UTM tracking completed');
            return;
        }

        // Create empty cookie if requested and no cookie exists
        if (forceCreate && !currentCookie) {
            this.log('No UTM parameters but force creating empty cookie');
            newCookieValue = this.createEmptyTrackingData();
            this.setCookie(newCookieValue);
            return;
        }

        this.log('No UTM parameters found and no force create requested, tracking skipped');
    }

    // Remove tracking cookie
    deleteCookie() {
        const cookieString = `${this.cookieName}=; path=/; domain=${this.domain}; max-age=0; SameSite=Lax`;
        document.cookie = cookieString;
        this.log('Cookie deleted');
    }
}

// Function to determine the correct cookie domain based on current hostname
function getDomainForCookies() {
    const hostname = window.location.hostname;
    
    // Check for baselane.com domains (including www.baselane.com)
    if (hostname.includes('baselane.com')) {
        return '.baselane.com'; // This allows cookies to work across all baselane.com subdomains
    }
    
    // Check for specific Webflow domains
    if (hostname === 'baselane-landing.webflow.io') {
        return 'baselane-landing.webflow.io';
    }
    
    if (hostname === 'baselane-main-website.webflow.io') {
        return 'baselane-main-website.webflow.io';
    }
    
    if (hostname === 'baselane-design-system.design.webflow.com') {
        return 'baselane-design-system.design.webflow.com';
    }
    
    // Default fallback for any other domains (no Webflow fallback)
    return hostname;
}

// Initialize tracker when page loads
document.addEventListener('DOMContentLoaded', () => {
    const domain = getDomainForCookies();
    
    const tracker = new UTMTracker({
        debug: false,
        domain: domain
    });

    tracker.track(true);
});