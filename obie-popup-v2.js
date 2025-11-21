const AppState = {
  address: {
    city: "",
    state: "",
    postalCode: "",
    addressLine1: "",
    streetNumber: "",
    fullAddress: "",
    country: ""
  },
  
  instances: {
    autocomplete: new Map(),
    phoneMask: new Map()
  },
  
  formData: {
    address: "",
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    rentalUnits: "",
    rentalIncome: ""
  },
  
  resetAddress() {
    this.address.city = "";
    this.address.state = "";
    this.address.postalCode = "";
    this.address.addressLine1 = "";
    this.address.streetNumber = "";
    this.address.fullAddress = "";
    this.address.country = "";
  },
  
  resetFormData() {
    this.formData = {
      address: "",
      email: "",
      phone: "",
      firstName: "",
      lastName: "",
      rentalUnits: "",
      rentalIncome: ""
    };
  },
  
  getAddressComponents() {
    return { ...this.address };
  }
};

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

function parseAddressComponents(place) {
  var components_by_type = {};

  AppState.resetAddress();

  if (!place.address_components) return;

  for (var i = 0; i < place.address_components.length; i++) {
    var c = place.address_components[i];
    for (var j = 0; j < c.types.length; j++) {
      components_by_type[c.types[j]] = c;
    }
  }

  for (var i in place.address_components) {
    var component = place.address_components[i];

    for (var j in component.types) {
      const addressType = place.address_components[i].types[j];
      
      if (addressType == "street_number") {
        AppState.address.streetNumber = components_by_type["street_number"].long_name;
      }
      
      if (addressType == "route") {
        AppState.address.addressLine1 = components_by_type["route"].short_name;
      }

      if (!AppState.address.city) {
        AppState.address.city = getCity(components_by_type, addressType);
      }

      if (!AppState.address.state && addressType == "administrative_area_level_1") {
        AppState.address.state = components_by_type["administrative_area_level_1"].short_name;
      }

      if (addressType == "country") {
        AppState.address.country = components_by_type["country"].long_name;
      }
      
      if (addressType == "postal_code") {
        AppState.address.postalCode = components_by_type["postal_code"].long_name;
      }
    }
  }

  if (AppState.address.streetNumber && AppState.address.addressLine1) {
    AppState.address.addressLine1 = AppState.address.streetNumber + " " + AppState.address.addressLine1;
  }

  if (!AppState.address.city) {
    console.warn("Warning: City not found in address");
  }
  if (!AppState.address.state) {
    console.warn("Warning: State not found in address");
  }

  AppState.address.fullAddress = place.formatted_address;

  return {
    streetNumber: AppState.address.streetNumber,
    addressLine1: AppState.address.addressLine1,
    city: AppState.address.city,
    state: AppState.address.state,
    postalCode: AppState.address.postalCode,
    country: AppState.address.country,
    fullAddress: AppState.address.fullAddress
  };
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function getUTMParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  
  return {
    utm_source: urlParams.get('utm_source') || null,
    utm_medium: urlParams.get('utm_medium') || null,
    utm_campaign: urlParams.get('utm_campaign') || null,
    utm_funnel: urlParams.get('utm_funnel') || null,
    utm_term: urlParams.get('utm_term') || null,
    utm_content: urlParams.get('utm_content') || null
  };
}

function getFacebookParameters() {
  return {
    fbc: getCookie('_fbc') || null,
    fbp: getCookie('_fbp') || null
  };
}

function getUserId() {
  if (typeof analytics !== 'undefined' && analytics.user && typeof analytics.user === 'function') {
    const user = analytics.user();
    if (user && typeof user.id === 'function') {
      return user.id() || null;
    }
  }
  
  if (typeof analytics !== 'undefined' && analytics.user && typeof analytics.user.id === 'function') {
    return analytics.user.id() || null;
  }
  
  return null;
}

function getMetaData() {
  const urlParams = getUTMParameters();
  const fbParams = getFacebookParameters();
  const userId = getUserId();
  const userAgent = navigator.userAgent || null;
  const pageUrl = window.location.href;
  
  return {
    page_url: pageUrl,
    utm_source: urlParams.utm_source,
    utm_medium: urlParams.utm_medium,
    utm_campaign: urlParams.utm_campaign,
    utm_funnel: urlParams.utm_funnel,
    utm_term: urlParams.utm_term,
    utm_content: urlParams.utm_content,
    fbc: fbParams.fbc,
    fbp: fbParams.fbp,
    user_agent: userAgent,
    user_id: userId
  };
}

function updateMetaFields(container, additionalData = {}) {
  if (!container) return;
  
  const metaContainer = container.querySelector('[p-obie__steps-meta]');
  if (!metaContainer) return;
  
  const urlParams = getUTMParameters();
  const fbParams = getFacebookParameters();
  const userId = getUserId();
  const userAgent = navigator.userAgent || null;
  const pageUrl = window.location.href;
  
  const metaFields = {
    'data-meta-page-url': pageUrl,
    'data-meta-utm-source': urlParams.utm_source,
    'data-meta-utm-medium': urlParams.utm_medium,
    'data-meta-utm-campaign': urlParams.utm_campaign,
    'data-meta-utm-funnel': urlParams.utm_funnel,
    'data-meta-utm-term': urlParams.utm_term,
    'data-meta-utm-content': urlParams.utm_content,
    'data-meta-fbc': fbParams.fbc,
    'data-meta-fbp': fbParams.fbp,
    'data-meta-email': additionalData.email || AppState.formData.email || null,
    'data-meta-user-agent': userAgent,
    'data-meta-user-id': userId
  };
  
  for (const [selector, value] of Object.entries(metaFields)) {
    const input = metaContainer.querySelector(`[${selector}]`);
    if (input) {
      input.value = value !== null ? value : '';
    }
  }
}

function initializeMetaFields() {
  const containers = document.querySelectorAll('[p-obie]');
  containers.forEach(container => {
    updateMetaFields(container);
  });
}

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
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAQQgvUnzjxrE1aUWS3IReG4io5CTFLHHw&libraries=places&callback=initGoogleMapsCallback';
    script.async = true;
    script.defer = true;
    
    script.onerror = () => reject(new Error('Failed to load Google Maps API'));
    
    document.head.appendChild(script);
  });
  
  return window.googleMapsAPILoading;
}

function loadIMaskLibrary() {
  if (window.IMask) {
    return Promise.resolve();
  }
  
  if (window.imaskLoading) {
    return window.imaskLoading;
  }
  
  window.imaskLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/imask@7.1.3/dist/imask.min.js';
    script.async = true;
    
    script.onload = () => {
      if (window.IMask) {
        resolve();
      } else {
        reject(new Error('IMask not properly loaded'));
      }
    };
    
    script.onerror = () => reject(new Error('Failed to load IMask'));
    
    document.head.appendChild(script);
  });
  
  return window.imaskLoading;
}

function initializePhoneMask() {
  const popupContainer = document.querySelector('#glightbox-body [popup__content]') || 
                        document.querySelector('#obie');
  
  if (!popupContainer) return;
  
  const phoneInput = popupContainer.querySelector('.obie-phone');
  
  if (!phoneInput) {
    return;
  }
  
  const inputId = phoneInput.id || 'popup-phone-' + Date.now();
  if (!phoneInput.id) {
    phoneInput.id = inputId;
  }
  
  if (AppState.instances.phoneMask.has(inputId)) {
    try {
      const existingMask = AppState.instances.phoneMask.get(inputId);
      if (existingMask && typeof existingMask.destroy === 'function') {
        existingMask.destroy();
      }
      AppState.instances.phoneMask.delete(inputId);
    } catch (error) {
      console.warn('Error cleaning up existing phone mask:', error);
    }
  }
  
  phoneInput.removeAttribute('data-mask-initialized');
  
  loadIMaskLibrary().then(() => {
    if (!window.IMask) {
      throw new Error('IMask not available');
    }
    
    const maskOptions = {
      mask: '+10000000000',
      lazy: true
    };
    
    const mask = IMask(phoneInput, maskOptions);
    
    AppState.instances.phoneMask.set(inputId, mask);
    
    phoneInput.setAttribute('data-mask-initialized', 'true');
    
  }).catch(error => {
    console.error('IMask failed to load:', error);
  });
}

function cleanupPhoneMaskInstances() {
  AppState.instances.phoneMask.forEach((mask, inputId) => {
    try {
      if (mask && typeof mask.destroy === 'function') {
        mask.destroy();
      }
    } catch (error) {
      console.warn('Error cleaning up phone mask instance:', inputId, error);
    }
  });
  AppState.instances.phoneMask.clear();
}

function initializePopupAddressAutocomplete() {
  const popupContainer = document.querySelector('#glightbox-body [popup__content]') ||
                        document.querySelector('#obie');

  if (!popupContainer) return;

  const addressInput = popupContainer.querySelector('.obie-address');

  if (!addressInput) {
    return;
  }

  const initStatus = addressInput.getAttribute('data-autocomplete-initialized');
  if (initStatus === 'true' || initStatus === 'pending') {
    return;
  }

  const inputId = addressInput.id || 'popup-address-' + Date.now();
  if (!addressInput.id) {
    addressInput.id = inputId;
  }

  if (AppState.instances.autocomplete.has(inputId)) {
    return;
  }

  addressInput.setAttribute('data-autocomplete-initialized', 'pending');

  loadGoogleMapsAPI().then(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      throw new Error('Google Maps Places API not available');
    }
    
    const autocomplete = new google.maps.places.Autocomplete(addressInput, {
      types: ['address'],
      componentRestrictions: { country: 'us' }
    });
    
    AppState.instances.autocomplete.set(inputId, autocomplete);
    addressInput.setAttribute('data-autocomplete-initialized', 'true');

    autocomplete.addListener('place_changed', function() {
      const place = autocomplete.getPlace();
      
      if (place.formatted_address) {
        addressInput.value = place.formatted_address;
        
        addressInput.setAttribute("data-autocompleted", "true");
        
        const parsedAddress = parseAddressComponents(place);
        
        showError(addressInput, false);
        
        const addressParsedEvent = new CustomEvent('addressParsed', {
          detail: parsedAddress
        });
        addressInput.dispatchEvent(addressParsedEvent);
      }
    });
    
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

  }).catch(error => {
    addressInput.removeAttribute('data-autocomplete-initialized');
    console.error('Google Maps API failed to load:', error);
  });
}

function cleanupAutocompleteInstances() {
  AppState.instances.autocomplete.forEach((autocomplete, inputId) => {
    try {
      if (autocomplete && typeof autocomplete.unbindAll === 'function') {
        autocomplete.unbindAll();
      }
    } catch (error) {
      console.warn('Error cleaning up autocomplete instance:', inputId, error);
    }
  });
  AppState.instances.autocomplete.clear();
}

function findActiveInputs() {
  const activePopup = document.querySelector('#glightbox-body [popup__content]') || 
                     document.querySelector('#obie');
  
  if (activePopup) {
    const addressInput = activePopup.querySelector('.obie-address');
    const emailInput = activePopup.querySelector('.obie-email');
    const phoneInput = activePopup.querySelector('.obie-phone');
    
    if (addressInput && emailInput && phoneInput &&
        addressInput.offsetParent !== null && 
        emailInput.offsetParent !== null &&
        phoneInput.offsetParent !== null) {
      return { addressInput, emailInput, phoneInput };
    }
  }
  
  const allAddressInputs = document.querySelectorAll('.obie-address');
  const allEmailInputs = document.querySelectorAll('.obie-email');
  const allPhoneInputs = document.querySelectorAll('.obie-phone');
  
  let visibleAddressInput = null;
  let visibleEmailInput = null;
  let visiblePhoneInput = null;
  
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
  
  for (let input of allPhoneInputs) {
    const isVisible = input.offsetParent !== null;
    if (isVisible) {
      visiblePhoneInput = input;
      break;
    }
  }
  
  return { 
    addressInput: visibleAddressInput, 
    emailInput: visibleEmailInput,
    phoneInput: visiblePhoneInput
  };
}

function isValidAreaCode(code) {
  const validAreaCodes = [
    '201', '202', '203', '205', '206', '207', '208', '209', '210', '212', '213', '214', '215',
    '216', '217', '218', '219', '220', '223', '224', '225', '228', '229', '231', '234', '239',
    '240', '248', '251', '252', '253', '254', '256', '260', '262', '267', '269', '270', '272',
    '274', '276', '279', '281', '283', '301', '302', '303', '304', '305', '307', '308', '309',
    '310', '312', '313', '314', '315', '316', '317', '318', '319', '320', '321', '323', '324',
    '325', '326', '327', '329', '330', '331', '332', '334', '336', '337', '339', '340', '341',
    '346', '347', '350', '351', '352', '353', '360', '361', '363', '364', '369', '380', '385',
    '386', '401', '402', '404', '405', '406', '407', '408', '409', '410', '412', '413', '414',
    '415', '417', '419', '423', '424', '425', '430', '432', '434', '435', '436', '445', '447',
    '448', '458', '463', '464', '469', '470', '472', '475', '478', '479', '480', '484', '501',
    '502', '503', '504', '505', '507', '508', '509', '510', '512', '513', '515', '516', '517',
    '518', '520', '530', '531', '534', '539', '540', '541', '559', '561', '562', '563', '564',
    '567', '570', '571', '572', '573', '574', '575', '580', '585', '586', '601', '602', '603',
    '605', '606', '607', '608', '609', '610', '612', '614', '615', '616', '617', '618', '619',
    '620', '623', '624', '626', '628', '629', '630', '631', '636', '640', '641', '645', '646',
    '650', '651', '656', '657', '659', '660', '661', '662', '667', '669', '670', '671', '678',
    '680', '681', '682', '684', '686', '689', '701', '702', '703', '704', '706', '707', '708',
    '712', '713', '714', '715', '716', '717', '718', '719', '720', '724', '725', '726', '727',
    '728', '730', '731', '732', '734', '737', '740', '743', '747', '754', '757', '760', '762',
    '763', '765', '769', '770', '771', '772', '773', '774', '775', '779', '781', '785', '786',
    '787', '801', '802', '803', '804', '805', '806', '808', '810', '812', '813', '814', '815',
    '816', '817', '818', '820', '826', '828', '830', '831', '832', '835', '838', '839', '840',
    '843', '845', '847', '848', '850', '854', '856', '857', '858', '859', '860', '861', '862',
    '863', '864', '865', '870', '872', '878', '901', '903', '904', '906', '907', '908', '909',
    '910', '912', '913', '914', '915', '916', '917', '918', '919', '920', '925', '928', '929',
    '930', '931', '934', '936', '937', '938', '939', '940', '941', '943', '945', '947', '948',
    '949', '951', '952', '954', '956', '959', '970', '971', '972', '973', '975', '978', '979',
    '980', '983', '984', '985', '986', '989'
  ];
  
  return validAreaCodes.includes(code);
}

function showError(input, show = true, customMessage = null) {
  if (!input) return;
  
  const inputContainer = input.closest('[input]');
  if (inputContainer) {
    inputContainer.setAttribute('error', show ? 'true' : 'false');
    
    if (customMessage && show) {
      inputContainer.setAttribute('error-message', customMessage);
    }
  }
}

function isRepeatingDigits(str) {
  if (str.length < 4) return false;
  
  const allSame = /^(\d)\1+$/.test(str);
  if (allSame) return true;
  
  let repeats = 0;
  for (let i = 1; i < str.length; i++) {
    if (str[i] === str[i-1]) {
      repeats++;
      if (repeats >= 6) return true;
    } else {
      repeats = 0;
    }
  }
  
  return false;
}

function validateInput(input, type) {
  if (!input) return false;
  
  const value = input.value.trim();
  let isValid = false;
  let errorMessage = null;
  
  const inputContainer = input.closest('[input]');
  const defaultErrorMessage = inputContainer ? inputContainer.getAttribute('error-message') : null;
  
  if (type === 'address') {
    isValid = value.length >= 3;
    errorMessage = defaultErrorMessage || 'Enter a properly address';
  } else if (type === 'email') {
    isValid = value.includes('@') && value.includes('.') && value.length > 5;
    errorMessage = defaultErrorMessage || 'Enter a valid e-mail';
  } else if (type === 'phone') {
    const digitsOnly = value.replace(/\D/g, '');
    
    if (digitsOnly.length !== 11) {
      isValid = false;
      errorMessage = defaultErrorMessage || 'Enter a valid phone number';
    } else if (isRepeatingDigits(digitsOnly)) {
      isValid = false;
      errorMessage = defaultErrorMessage || 'Enter a valid phone number';
    } else {
      const areaCode = digitsOnly.substring(1, 4);
      
      if (!isValidAreaCode(areaCode)) {
        isValid = false;
        errorMessage = 'Enter a valid US area code';
      } else {
        isValid = true;
      }
    }
  } else if (type === 'text') {
    isValid = value.length >= 2;
    errorMessage = defaultErrorMessage || 'This field is required';
  }
  
  showError(input, !isValid, errorMessage);
  return isValid;
}

function validateForm() {
  const { addressInput, emailInput, phoneInput } = findActiveInputs();
  
  if (!addressInput || !emailInput || !phoneInput) {
    return { isValid: false, inputs: null };
  }
  
  const addressValid = validateInput(addressInput, 'address');
  const emailValid = validateInput(emailInput, 'email');
  const phoneValid = validateInput(phoneInput, 'phone');
  
  const isValid = addressValid && emailValid && phoneValid;
  
  return { 
    isValid, 
    inputs: { addressInput, emailInput, phoneInput },
    values: {
      address: addressInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim()
    }
  };
}

function showStep(stepNumber) {
  const popupContainer = document.querySelector('#glightbox-body [p-obie]') ||
                        document.querySelector('[p-obie]');

  if (!popupContainer) return;

  const allSteps = popupContainer.querySelectorAll('[p-obie__step]');
  allSteps.forEach(step => {
    step.style.display = 'none';
  });

  const targetStep = popupContainer.querySelector(`.p-obie__step-${stepNumber}`);
  if (targetStep) {
    targetStep.style.display = 'block';
  }
}

function hideFormWrapper() {
  const popupContainer = document.querySelector('#glightbox-body [p-obie]') ||
                        document.querySelector('[p-obie]');

  if (!popupContainer) return;

  const formWrapper = popupContainer.querySelector('[p-obie__form-wrapper]');
  if (formWrapper) {
    formWrapper.style.display = 'none';
  }
}

function showFormWrapper() {
  const popupContainer = document.querySelector('#glightbox-body [p-obie]') ||
                        document.querySelector('[p-obie]');

  if (!popupContainer) return;

  const formWrapper = popupContainer.querySelector('[p-obie__form-wrapper]');
  if (formWrapper) {
    formWrapper.style.display = 'block';
  }

  const allSteps = popupContainer.querySelectorAll('[p-obie__step]');
  allSteps.forEach(step => {
    step.style.display = 'none';
  });
}

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
    
    const params = new URLSearchParams();
    
    params.append('name', formName);
    params.append('pageId', pageId);
    params.append('elementId', elementId);
    params.append('domain', window.location.hostname);
    params.append('source', window.location.href);
    params.append('test', 'false');
    params.append('dolphin', 'false');
    
    params.append('fields[Property Address]', AppState.formData.address || '');
    params.append('fields[Valid Email]', AppState.formData.email || '');
    params.append('fields[Phone Number]', AppState.formData.phone || '');
    params.append('fields[First Name]', AppState.formData.firstName || '');
    params.append('fields[Last Name]', AppState.formData.lastName || '');
    params.append('fields[Rental Units]', AppState.formData.rentalUnits || '');
    params.append('fields[Rental Income]', AppState.formData.rentalIncome || '');
    
    const metaContainer = form.querySelector('[p-obie__steps-meta]');
    if (metaContainer) {
      const metaInputs = metaContainer.querySelectorAll('input[type="hidden"]');
      metaInputs.forEach(input => {
        const fieldName = input.getAttribute('name');
        const fieldValue = input.value || '';
        if (fieldName) {
          params.append(`fields[${fieldName}]`, fieldValue);
        }
      });
    }
    
    console.log('Submitting form to Webflow:', {
      siteId: siteId,
      pageId: pageId,
      elementId: elementId,
      formName: formName
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
      if (response.ok) {
        console.log('Form successfully submitted to Webflow');
      } else {
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

function handleObieSubmission(email, phone, address) {
  const popupContainer = document.querySelector('[p-obie]');
  
  let launchAfterObieValue = null;
  if (popupContainer) {
    const launchElement = popupContainer.querySelector('[data-launch-after-obie]');
    if (launchElement) {
      launchAfterObieValue = launchElement.getAttribute('data-launch-after-obie');
    }
  }
  
  const formContainer = document.querySelector('#glightbox-body [p-obie]') ||
                       document.querySelector('[p-obie]');
  
  if (formContainer) {
    submitFormToWebflow(formContainer);
  }
  
  proceedWithObie();
  
  function proceedWithObie() {
    if (typeof Obie !== 'undefined') {
      closePopupAndOpenObie();
      return;
    }
    
    const obieScript = document.createElement('script');
    obieScript.src = 'https://static.obierisk.com/sdk/obie.js';
    
    obieScript.onload = function() {
      console.log('Obie script loaded successfully');
      closePopupAndOpenObie();
    };
    
    obieScript.onerror = function() {
      console.error('Failed to load Obie script');
    };
    
    document.head.appendChild(obieScript);
  }
  
  function closePopupAndOpenObie() {
    const glightboxContainer = document.querySelector('.glightbox-container');
    if (glightboxContainer) {
      const closeBtn = glightboxContainer.querySelector('.gclose');
      if (closeBtn) {
        closeBtn.click();
      }
    }
    
    if (typeof closeCurrentLightbox === 'function') {
      closeCurrentLightbox();
    }
    
    if (typeof analytics !== 'undefined' && typeof analytics.track === 'function') {
      analytics.track('obie_quote_started', {
        email: email,
        phone: phone
      });
    }
    
    if (typeof Obie === 'undefined') {
      console.error('Obie is still not defined');
      return;
    }
    
    let quoteCreated = false;
    
    Obie.events.on("quote_created", ({ quoteRequestId }) => {
      quoteCreated = true;

      if (window.dataLayer) {
        dataLayer.push({'event':'obie_quote_created'});
      }

      console.log('Quote created - quoteCreated is now true');
      if (typeof analytics !== 'undefined' && typeof analytics.track === 'function') {
        analytics.track('obie_quote_created', {
          quoteRequestId: quoteRequestId
        });
      }
    });
    
    Obie.events.on("modal_closed", () => {
      if (quoteCreated) {
        console.log("Obie popup closed");
        
        let targetToLaunch = null;
        
        if (window.obieQuoteSuccessPopupTarget && window.obieQuoteSuccessPopupTarget.trim() !== '') {
          targetToLaunch = window.obieQuoteSuccessPopupTarget;
        }
        else if (launchAfterObieValue && launchAfterObieValue.trim() !== '') {
          targetToLaunch = launchAfterObieValue;
        }
        
        if (targetToLaunch && typeof GLightbox !== 'undefined') {
          if (typeof analytics !== 'undefined' && typeof analytics.track === 'function') {
            analytics.track('website_obie_popup_redirect_loaded');
          }
          
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
              }
            });
            
            glightbox.open();
          } else {
            console.warn(`No inline content found for selector: ${targetToLaunch}`);
          }
        }
      }
    });

    const addressToSend = AppState.address.addressLine1 || '';
    
    const URLParams = new URLSearchParams(window.location.search);
    const gclid = URLParams.get('gclid');
    
    const hostname = window.location.hostname;
    let partnerId;
    let isProduction = false;
    
    if (hostname === 'www.baselane.com' || hostname.endsWith('.baselane.com')) {
      partnerId = '69214a56-7199-48a2-861d-27518409407c';
      isProduction = true;
    } else if (
      hostname === 'baselane-design-system.webflow.io' ||
      hostname === 'baselane-main-website.webflow.io' ||
      hostname === 'baselane-landing.webflow.io'
    ) {
      partnerId = '3c9219c8-31d0-43e3-91b5-a871758f1f94';
      isProduction = false;
    } else {
      partnerId = '3c9219c8-31d0-43e3-91b5-a871758f1f94';
      isProduction = false;
    }
    
    console.log('Opening Obie with data:', {
      email: email,
      phone: phone,
      firstName: AppState.formData.firstName,
      lastName: AppState.formData.lastName,
      addressLine1: addressToSend,
      city: AppState.address.city,
      state: AppState.address.state,
      postalCode: AppState.address.postalCode
    });
    
    Obie.open({
      partnerId: partnerId,
      sandbox: !isProduction,
      values: {
        person: {
          firstName: AppState.formData.firstName,
          lastName: AppState.formData.lastName,
          email: email,
          phoneNumber: phone,
        },
        property: {
          addressLine1: addressToSend,
          city: AppState.address.city,
          state: AppState.address.state, 
          postalCode: AppState.address.postalCode,
        },
      },
      metadata: {
        email: email,
        phone: phone,
        uniqueCode: gclid
      },
    });
  }
}

function validateAndSubmit() {
  const validation = validateForm();
  
  if (!validation.isValid) {
    return false;
  }
  
  const { address, email, phone } = validation.values;
  
  AppState.formData.address = address;
  AppState.formData.email = email;
  AppState.formData.phone = phone;
  
  const popupContainer = document.querySelector('#glightbox-body [p-obie]') ||
                        document.querySelector('[p-obie]');
  if (popupContainer) {
    updateMetaFields(popupContainer, { email: email });
  }
  
  if (typeof analytics !== 'undefined' && typeof analytics.track === 'function') {
    analytics.track('obie_form_start_partial_lead', {
      email: email,
      phone: phone,
      address: address,
      sfdc_Lead_Source: window.global_sfdc_Lead_Source
    });
  }
  
  hideFormWrapper();
  showStep(1);
  
  return true;
}

function setupStep1() {
  const popupContainers = document.querySelectorAll('[p-obie]');

  popupContainers.forEach(function(container) {
    const nextButton = container.querySelector('.p-obie-step-form-next');
    if (!nextButton) return;

    const newButton = nextButton.cloneNode(true);
    nextButton.parentNode.replaceChild(newButton, nextButton);

    newButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      const step1 = container.querySelector('.p-obie__step-1');
      if (!step1) return;
      
      const firstNameInput = step1.querySelector('.obie-first-name');
      const lastNameInput = step1.querySelector('input[name="obie-last-name"]');
      
      if (!firstNameInput || !lastNameInput) {
        console.warn('First name or last name input not found');
        return;
      }
      
      const firstNameValid = validateInput(firstNameInput, 'text');
      const lastNameValid = validateInput(lastNameInput, 'text');
      
      if (firstNameValid && lastNameValid) {
        AppState.formData.firstName = firstNameInput.value.trim();
        AppState.formData.lastName = lastNameInput.value.trim();
        
        updateMetaFields(container, { email: AppState.formData.email });
        
        if (typeof analytics !== 'undefined' && typeof analytics.track === 'function') {
          analytics.track('obie_form_step_1', {
            firstName: AppState.formData.firstName,
            lastName: AppState.formData.lastName,
            email: AppState.formData.email,
            phone: AppState.formData.phone,
            address: AppState.formData.address
          });
        }
        
        showStep(2);
      }
    });
  });
}

function setupStep2() {
  const popupContainers = document.querySelectorAll('[p-obie]');

  popupContainers.forEach(function(container) {
    const step2 = container.querySelector('.p-obie__step-2');
    if (!step2) return;

    const radioRows = step2.querySelectorAll('[radio-row]');

    radioRows.forEach(function(row) {
      const radio = row.querySelector('input[name="obie-step-2-rental-units"]');
      const label = row.querySelector('[radio-row__label]');
      
      if (!radio) return;
      
      const newRadio = radio.cloneNode(true);
      radio.parentNode.replaceChild(newRadio, radio);
      
      const handleSelection = function() {
        if (newRadio.checked) {
          AppState.formData.rentalUnits = newRadio.value;
          updateMetaFields(container, { email: AppState.formData.email });
          
          if (typeof analytics !== 'undefined' && typeof analytics.track === 'function') {
            analytics.track('obie_form_step_2', {
              rentalUnits: newRadio.value,
              email: AppState.formData.email,
              phone: AppState.formData.phone,
              firstName: AppState.formData.firstName,
              lastName: AppState.formData.lastName
            });
          }
          
          showStep(3);
        }
      };
      
      newRadio.addEventListener('change', handleSelection);
      
      if (label) {
        const newLabel = label.cloneNode(true);
        label.parentNode.replaceChild(newLabel, label);
        
        newLabel.addEventListener('click', function(e) {
          e.preventDefault();
          newRadio.checked = true;
          handleSelection();
        });
      }
    });
  });
}

function setupStep3() {
  const popupContainers = document.querySelectorAll('[p-obie]');

  popupContainers.forEach(function(container) {
    const step3 = container.querySelector('.p-obie__step-3');
    if (!step3) return;

    const radioRows = step3.querySelectorAll('[radio-row]');

    radioRows.forEach(function(row) {
      const radio = row.querySelector('input[name="obie-step-3-rental-income"]');
      const label = row.querySelector('[radio-row__label]');
      
      if (!radio) return;
      
      const newRadio = radio.cloneNode(true);
      radio.parentNode.replaceChild(newRadio, radio);
      
      const handleSelection = function() {
        if (newRadio.checked) {
          AppState.formData.rentalIncome = newRadio.value;
          
          updateMetaFields(container, { email: AppState.formData.email });
          
          if (typeof analytics !== 'undefined' && typeof analytics.track === 'function') {
            const metaData = getMetaData();
            
            analytics.track('lp_lead', {
              firstName: AppState.formData.firstName,
              lastName: AppState.formData.lastName,
              email: AppState.formData.email,
              phone: AppState.formData.phone,
              address: AppState.formData.address,
              rentalIncome: newRadio.value,
              rentalUnits: AppState.formData.rentalUnits,
              sfdc_Lead_Source: window.global_sfdc_Lead_Source
            }, {
              context: {
                traits: metaData
              }
            });
          }
          
          console.log('Form completed with data:', AppState.formData);
          
          handleObieSubmission(AppState.formData.email, AppState.formData.phone, AppState.formData.address);
        }
      };
      
      newRadio.addEventListener('change', handleSelection);
      
      if (label) {
        const newLabel = label.cloneNode(true);
        label.parentNode.replaceChild(newLabel, label);
        
        newLabel.addEventListener('click', function(e) {
          e.preventDefault();
          newRadio.checked = true;
          handleSelection();
        });
      }
    });
  });
}

function setupRealTimeValidation() {
  document.addEventListener('focus', function(event) {
    const input = event.target;
    
    if (input.classList.contains('obie-address') || 
        input.classList.contains('obie-email') || 
        input.classList.contains('obie-phone') ||
        input.classList.contains('obie-first-name') ||
        input.name === 'obie-last-name') {
      const inputContainer = input.closest('[input]');
      
      if (inputContainer && inputContainer.getAttribute('error') === 'true') {
        showError(input, false);
      }
    }
  }, true);
  
  document.addEventListener('blur', function(event) {
    const input = event.target;
    
    if (!input.value || input.value.trim().length === 0) {
      return;
    }
    
    if (input.classList.contains('obie-address')) {
      setTimeout(function() {
        if (input.getAttribute('data-autocompleted') === 'true') {
          input.removeAttribute('data-autocompleted');
          return;
        }
        validateInput(input, 'address');
      }, 100);
    } else if (input.classList.contains('obie-email')) {
      validateInput(input, 'email');
    } else if (input.classList.contains('obie-phone')) {
      validateInput(input, 'phone');
    } else if (input.classList.contains('obie-first-name') || input.name === 'obie-last-name') {
      validateInput(input, 'text');
    }
  }, true);
}

function setupFormSubmission() {
  const submitButtons = document.querySelectorAll('.p-obie__form-submit');
  
  submitButtons.forEach(function(button) {
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      validateAndSubmit();
    });
  });
}

function initializeAllSteps() {
  setupFormSubmission();
  setupStep1();
  setupStep2();
  setupStep3();
  setupRealTimeValidation();
  initializeMetaFields();
}

document.addEventListener('DOMContentLoaded', function() {
  initializeAllSteps();
});

if (document.readyState !== 'loading') {
  initializeAllSteps();
}

const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    mutation.addedNodes.forEach(function(node) {
      if (node.nodeType === 1) {
        if (node.querySelector && (node.querySelector('[p-obie__steps]') || node.querySelector('.p-obie__form-submit'))) {
          setTimeout(function() {
            initializeAllSteps();
            initializePopupAddressAutocomplete();
            initializePhoneMask();
            showFormWrapper();
          }, 100);
        }
        
        if (node.id === 'glightbox-body' || 
            (node.classList && node.classList.contains('glightbox-container'))) {
          setTimeout(function() {
            initializePopupAddressAutocomplete();
            initializePhoneMask();
            showFormWrapper();
            initializeMetaFields();
          }, 200);
        }
      }
    });
    
    mutation.removedNodes.forEach(function(node) {
      if (node.nodeType === 1) {
        if (node.id === 'glightbox-body' || 
            (node.classList && node.classList.contains('glightbox-container'))) {
          setTimeout(function() {
            cleanupAutocompleteInstances();
            cleanupPhoneMaskInstances();
            
            AppState.resetFormData();
          }, 100);
        }
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

document.addEventListener('DOMContentLoaded', function() {
  if (typeof GLightbox !== 'undefined') {
    const originalOpen = GLightbox.prototype.open;
    if (originalOpen) {
      GLightbox.prototype.open = function() {
        const result = originalOpen.apply(this, arguments);
        setTimeout(function() {
          initializePopupAddressAutocomplete();
          initializePhoneMask();
          showFormWrapper();
          initializeMetaFields();
        }, 300);
        return result;
      };
    }
    
    const originalClose = GLightbox.prototype.close;
    if (originalClose) {
      GLightbox.prototype.close = function() {
        cleanupAutocompleteInstances();
        cleanupPhoneMaskInstances();
        
        AppState.resetFormData();
        
        return originalClose.apply(this, arguments);
      };
    }
  }
});

let lastPopupState = null;
setInterval(function() {
  const popup = document.querySelector('#glightbox-slider');
  const currentPopupState = popup ? popup.innerHTML.length : 0;
  
  if (popup && currentPopupState !== lastPopupState) {
    setTimeout(function() {
      initializePopupAddressAutocomplete();
      initializePhoneMask();
      initializeMetaFields();
    }, 100);
    lastPopupState = currentPopupState;
    
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
  } else if (!popup && lastPopupState !== null) {
    cleanupAutocompleteInstances();
    cleanupPhoneMaskInstances();
    lastPopupState = null;
  }
}, 500);

function getCurrentAddressComponents() {
  return AppState.getAddressComponents();
}