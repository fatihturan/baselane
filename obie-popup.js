// Global variables for address components
var city = "";
var state = "";
var postalCode = "";
var addressLine1 = "";
var streetNumber = "";
var address = "";
var country = "";

// Helper function to get city from address components
function getCity(components_by_type, addressType) {
  if (addressType == "locality") {
    return components_by_type["locality"].long_name;
  }
  if (addressType == "sublocality_level_1") {
    return components_by_type["sublocality_level_1"].long_name;
  }
  if (addressType == "administrative_area_level_2") {
    return components_by_type["administrative_area_level_2"].long_name;
  }
  return "";
}

// Function to parse address components
function parseAddressComponents(place) {
  var components_by_type = {};

  // Reset global variables
  city = "";
  state = "";
  postalCode = "";
  addressLine1 = "";
  streetNumber = "";
  country = "";

  if (!place.address_components) return;

  // Process address components
  for (var i = 0; i < place.address_components.length; i++) {
    var c = place.address_components[i];
    for (var j = 0; j < c.types.length; j++) {
      components_by_type[c.types[j]] = c;
    }
  }

  // Extract address details
  for (var i in place.address_components) {
    var component = place.address_components[i];

    for (var j in component.types) {
      const addressType = place.address_components[i].types[j];
      
      if (addressType == "street_number") {
        streetNumber = components_by_type["street_number"].long_name;
      }
      
      if (addressType == "route") {
        addressLine1 = components_by_type["route"].short_name;
      }

      if (!city) {
        city = getCity(components_by_type, addressType);
      }

      if (!state && addressType == "administrative_area_level_1") {
        state = components_by_type["administrative_area_level_1"].short_name;
      }

      if (addressType == "country") {
        country = components_by_type["country"].long_name;
      }
      
      if (addressType == "postal_code") {
        postalCode = components_by_type["postal_code"].long_name;
      }
    }
  }

  // Combine street number and route for full address line
  if (streetNumber && addressLine1) {
    addressLine1 = streetNumber + " " + addressLine1;
  }

  // Validate required fields
  if (!city) {
    console.warn("Warning: City not found in address");
  }
  if (!state) {
    console.warn("Warning: State not found in address");
  }

  // Store full address
  address = place.formatted_address;

  return {
    streetNumber: streetNumber,
    addressLine1: addressLine1,
    city: city,
    state: state,
    postalCode: postalCode,
    country: country,
    fullAddress: address
  };
}

// Google Maps Places API initialization
function loadGoogleMapsAPI() {
  if (window.google && window.google.maps && window.google.maps.places) {
    return Promise.resolve();
  }
  
  if (window.googleMapsAPILoading) {
    return window.googleMapsAPILoading;
  }
  
  window.googleMapsAPILoading = new Promise((resolve, reject) => {
    window.initGoogleMapsCallback = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        resolve();
      } else {
        reject(new Error('Google Maps API not properly loaded'));
      }
    };
    
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAPXiZqQFEjY4PEkY8vu22hVCFQppGTW4Q&libraries=places&callback=initGoogleMapsCallback';
    script.async = true;
    script.defer = true;
    
    script.onerror = () => reject(new Error('Failed to load Google Maps API'));
    
    document.head.appendChild(script);
  });
  
  return window.googleMapsAPILoading;
}

function initializePopupAddressAutocomplete() {
  // Only initialize for popup address inputs
  const popupContainer = document.querySelector('#glightbox-body [popup__content]') || 
                        document.querySelector('#obie');
  
  if (!popupContainer) return;
  
  const addressInput = popupContainer.querySelector('.obie-address');
  
  if (!addressInput || addressInput.getAttribute('data-autocomplete-initialized')) {
    return;
  }
  
  loadGoogleMapsAPI().then(() => {
    // Double check that everything is loaded
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      throw new Error('Google Maps Places API not available');
    }
    
    const autocomplete = new google.maps.places.Autocomplete(addressInput, {
      types: ['address'],
      componentRestrictions: { country: 'us' }
    });
    
    // Enhanced place_changed listener with address parsing
    autocomplete.addListener('place_changed', function() {
      const place = autocomplete.getPlace();
      
      if (place.formatted_address) {
        addressInput.value = place.formatted_address;
        
        // Mark as autocompleted
        addressInput.setAttribute("data-autocompleted", "true");
        
        // Parse address components
        const parsedAddress = parseAddressComponents(place);
        
        // Clear any existing error when address is selected
        showError(addressInput, false);
        
        // Trigger custom event with parsed address data
        const addressParsedEvent = new CustomEvent('addressParsed', {
          detail: parsedAddress
        });
        addressInput.dispatchEvent(addressParsedEvent);
      }
    });
    
    // Add high z-index to autocomplete dropdown
    const style = document.createElement('style');
    style.textContent = `
      .pac-container {
        z-index: 999999 !important;
      }
    `;
    if (!document.querySelector('style[data-pac-container]')) {
      style.setAttribute('data-pac-container', 'true');
      document.head.appendChild(style);
    }
    
    addressInput.setAttribute('data-autocomplete-initialized', 'true');
  }).catch(error => {
    console.error('Google Maps API failed to load:', error);
  });
}

// Obie form validation for Webflow
function findActiveInputs() {
  // First try to find inputs within the active popup
  const activePopup = document.querySelector('#glightbox-body [popup__content]') || 
                     document.querySelector('#obie');
  
  if (activePopup) {
    const addressInput = activePopup.querySelector('.obie-address');
    const emailInput = activePopup.querySelector('.obie-email');
    
    if (addressInput && emailInput && 
        addressInput.offsetParent !== null && 
        emailInput.offsetParent !== null) {
      return { addressInput, emailInput };
    }
  }
  
  // Fallback to original method
  const allAddressInputs = document.querySelectorAll('.obie-address');
  const allEmailInputs = document.querySelectorAll('.obie-email');
  
  let visibleAddressInput = null;
  let visibleEmailInput = null;
  
  for (let input of allAddressInputs) {
    const isVisible = input.offsetParent !== null;
    if (isVisible) {
      visibleAddressInput = input;
      break;
    }
  }
  
  for (let input of allEmailInputs) {
    const isVisible = input.offsetParent !== null;
    if (isVisible) {
      visibleEmailInput = input;
      break;
    }
  }
  
  return { addressInput: visibleAddressInput, emailInput: visibleEmailInput };
}

function showError(input, show = true) {
  if (!input) return;
  
  const inputContainer = input.closest('[input]');
  if (inputContainer) {
    inputContainer.setAttribute('error', show ? 'true' : 'false');
  }
}

function validateInput(input, type) {
  if (!input) return false;
  
  const value = input.value.trim();
  let isValid = false;
  
  if (type === 'address') {
    isValid = value.length >= 3;
  } else if (type === 'email') {
    isValid = value.includes('@') && value.includes('.') && value.length > 5;
  }
  
  showError(input, !isValid);
  return isValid;
}

function validateForm() {
  const { addressInput, emailInput } = findActiveInputs();
  
  if (!addressInput || !emailInput) {
    return { isValid: false, inputs: null };
  }
  
  const addressValid = validateInput(addressInput, 'address');
  const emailValid = validateInput(emailInput, 'email');
  
  const isValid = addressValid && emailValid;
  
  return { 
    isValid, 
    inputs: { addressInput, emailInput },
    values: {
      address: addressInput.value.trim(),
      email: emailInput.value.trim()
    }
  };
}

function showLoadingState(form, email, address) {
  const popupContainer = form.closest('#obie') || form.closest('[popup__content]');
  
  // Get data-launch-after-obie value
  let launchAfterObieValue = null;
  if (popupContainer) {
    const launchElement = popupContainer.querySelector('[data-launch-after-obie]');
    if (launchElement) {
      launchAfterObieValue = launchElement.getAttribute('data-launch-after-obie');
    }
  }
  
  if (popupContainer) {
    const formWrapper = popupContainer.querySelector('[p-obie__form-wrapper]');
    const loadingElement = popupContainer.querySelector('[p-obie__loading]');
    
    if (formWrapper) {
      formWrapper.style.display = 'none';
    }
    
    if (loadingElement) {
      loadingElement.style.display = 'block';
    }
  }
  
  // Load Obie script immediately when loading starts
  const obieScript = document.createElement('script');
  obieScript.src = 'https://static.obierisk.com/sdk/obie.js';
  
  obieScript.onerror = function() {
    console.error('Failed to load Obie script');
  };
  
  document.head.appendChild(obieScript);
  
  setTimeout(function() {
    if (typeof closeCurrentLightbox === 'function') {
      closeCurrentLightbox();
    }
    
    // Analytics tracking for obie_quote_started
    if (typeof analytics !== 'undefined' && typeof analytics.track === 'function') {
      analytics.track('obie_quote_started', {
        email: email
      });
    }
    
    // Open Obie after popup closes (script should be loaded by now)
    if (typeof Obie !== 'undefined') {
      let quoteCreated = false;
      
      // Set up quote_created event listener
      Obie.events.on("quote_created", ({ quoteRequestId }) => {
        quoteCreated = true;
        console.log('Quote created - quoteCreated is now true');
        if (typeof analytics !== 'undefined' && typeof analytics.track === 'function') {
          analytics.track('obie_quote_created', {
            quoteRequestId: quoteRequestId
          });
        }
      });
      
      // Set up popup closed event listener
      Obie.events.on("modal_closed", () => {
        if (quoteCreated) {
          if (typeof analytics !== 'undefined' && typeof analytics.track === 'function') {
            analytics.track('website_obie_popup_redirect_loaded');
          }
          console.log("Quote created");
          
          // Launch after-obie content if specified
          let targetToLaunch = null;
          
          // Priority 1: Check window.obieQuoteSuccessPopupTarget
          if (window.obieQuoteSuccessPopupTarget && window.obieQuoteSuccessPopupTarget.trim() !== '') {
            targetToLaunch = window.obieQuoteSuccessPopupTarget;
          }
          // Priority 2: Check data-launch-after-obie attribute
          else if (launchAfterObieValue && launchAfterObieValue.trim() !== '') {
            targetToLaunch = launchAfterObieValue;
          }
          
          if (targetToLaunch && typeof GLightbox !== 'undefined') {
            // Find the target element
            const targetElement = document.querySelector(targetToLaunch);
            
            if (targetElement) {
              console.log('Launching popup with target:', targetToLaunch);
              
              const glightbox = GLightbox({
                elements: [{
                  content: targetElement.outerHTML,
                  width: 'auto',
                  height: 'auto'
                }],
                loop: false,
                autoplayVideos: true,
                closeButton: false,
                arrows: false,
                draggable: false,
                touchNavigation: false,
                keyboardNavigation: false,
                onOpen: function() {
                  // Add close button event listener after popup opens
                  setTimeout(() => {
                    const closeButton = document.querySelector('.glightbox-container .popup__close-button');
                    if (closeButton) {
                      closeButton.addEventListener('click', function(e) {
                        e.preventDefault();
                        glightbox.close();
                      });
                    }
                  }, 100);
                },
                onClose: function() {
                  // Clean up if needed
                }
              });
              
              glightbox.open();
            } else {
              console.warn(`No inline content found for selector: ${targetToLaunch}`);
            }
          }
        }
      });
      
      // Prepare address line for Obie - use already combined addressLine1
      const address = addressLine1 || '';
      
      // Get gclid from URL parameters
      const URLParams = new URLSearchParams(window.location.search);
      const gclid = URLParams.get('gclid');
      
      // Determine environment and set appropriate API key
      const hostname = window.location.hostname;
      let partnerId;
      let isProduction = false;
      
      if (hostname === 'www.baselane.com' || hostname.endsWith('.baselane.com')) {
        // Production environment
        partnerId = '69214a56-7199-48a2-861d-27518409407c';
        isProduction = true;
      } else if (
        hostname === 'baselane-design-system.webflow.io' ||
        hostname === 'baselane-main-website.webflow.io' ||
        hostname === 'baselane-landing.webflow.io'
      ) {
        // Staging environment
        partnerId = '3c9219c8-31d0-43e3-91b5-a871758f1f94';
        isProduction = false;
      } else {
        // Default to staging for unknown environments
        partnerId = '3c9219c8-31d0-43e3-91b5-a871758f1f94';
        isProduction = false;
      }
      
      // Use parsed address components instead of hardcoded values
      Obie.open({
        partnerId: partnerId,
        sandbox: !isProduction,
        values: {
          person: {
            email: email,
          },
          property: {
            addressLine1: address,
            city: city,
            state: state, 
            postalCode: postalCode,
          },
        },
        metadata: {
          email: email,
          uniqueCode: gclid
        },
      });
    }
  }, 5000);
}

function validateAndSubmit(form) {
  const validation = validateForm();
  
  if (!validation.isValid) {
    return false;
  }
  
  const { address, email } = validation.values;
  
  // Get new property radio button value
  const popupContainer = form.closest('#obie') || form.closest('[popup__content]');
  let isNewProperty = null;
  
  if (popupContainer) {
    const checkedRadio = popupContainer.querySelector('input[name="is-this-a-new-prop"]:checked');
    if (checkedRadio) {
      isNewProperty = checkedRadio.id === 'new-prop-yes' ? 'yes' : 'no';
    }
  }
  
  // Analytics tracking for lp_lead only
  if (typeof analytics !== 'undefined' && typeof analytics.track === 'function') {
    analytics.track('lp_lead', {
      email: email,
      sfdc_Lead_Source: window.global_sfdc_Lead_Source,
      isNewProperty: isNewProperty
    });
  }
  
  showLoadingState(form, email, address);
  
  return true;
}

function setupRealTimeValidation() {
  document.addEventListener('focus', function(event) {
    const input = event.target;
    
    if (input.classList.contains('obie-address') || input.classList.contains('obie-email')) {
      const inputContainer = input.closest('[input]');
      
      if (inputContainer && inputContainer.getAttribute('error') === 'true') {
        showError(input, false);
      }
    }
  }, true);
  
  document.addEventListener('input', function(event) {
    const input = event.target;
    
    // Only validate email in real-time, not address
    if (input.classList.contains('obie-email')) {
      validateInput(input, 'email');
    }
  });
}

function setupFormSubmission() {
  const forms = document.querySelectorAll('[p-obie__form]');
  
  forms.forEach(function(form) {
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    newForm.addEventListener('submit', function(event) {
      event.preventDefault();
      event.stopPropagation();
      validateAndSubmit(newForm);
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  setupFormSubmission();
  setupRealTimeValidation();
});

if (document.readyState !== 'loading') {
  setupFormSubmission();
  setupRealTimeValidation();
}

const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    mutation.addedNodes.forEach(function(node) {
      if (node.nodeType === 1 && node.querySelector && node.querySelector('[p-obie__form]')) {
        setTimeout(function() {
          setupFormSubmission();
          setupRealTimeValidation();
          initializePopupAddressAutocomplete();
        }, 100);
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

setInterval(function() {
    const popup = document.querySelector('#glightbox-slider');
    if (popup) {
        const radios = popup.querySelectorAll('input[type="radio"][id]');
        radios.forEach(function(radio) {
            const label = popup.querySelector('label[for="' + radio.id + '"]');
            if (label && !label.dataset.fixed) {
                label.dataset.fixed = 'true';
                label.addEventListener('click', function(e) {
                    e.preventDefault();
                    radio.checked = true;
                    radio.dispatchEvent(new Event('change', { bubbles: true }));
                });
            }
        });
    }
}, 500);

// Utility function to get current parsed address components
function getCurrentAddressComponents() {
  return {
    streetNumber: streetNumber,
    addressLine1: addressLine1,
    city: city,
    state: state,
    postalCode: postalCode,
    country: country,
    fullAddress: address
  };
}