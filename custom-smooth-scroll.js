// Disable Webflow's built-in smooth scrolling (original from: https://www.memberstack.com/scripts/anchor-link-offset)
var Webflow = Webflow || [];
Webflow.push(function() {
	$(function() { 
		$(document).off('click.wf-scroll');
	});
});

// Smooth scroll implementation with customizable settings
(function() {
	// Customizable settings
	const SCROLL_SETTINGS = {
		duration: 1000, // in milliseconds
		easing: 'easeInOutCubic' // 'linear', 'easeInQuad', 'easeOutQuad', 'easeInOutQuad', 'easeInCubic', 'easeOutCubic', 'easeInOutCubic'
	};

	const EASING_FUNCTIONS = {
		linear: t => t,
		easeInQuad: t => t * t,
		easeOutQuad: t => t * (2 - t),
		easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
		easeInCubic: t => t * t * t,
		easeOutCubic: t => (--t) * t * t + 1,
		easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
	};

	function getOffset(clickedElement) {
		// Find the closest element with disable-smooth-scroll attribute
		let element = clickedElement.closest('[disable-smooth-scroll]');
		if (!element) {
			// If clicked element doesn't have the attribute, check if it's inside one
			element = clickedElement.closest('[disable-smooth-scroll]');
		}
		
		if (!element) return 0;
		
		// Get offset value from the attribute
		const offsetValue = element.getAttribute('disable-smooth-scroll');
		return offsetValue && !isNaN(parseInt(offsetValue)) ? parseInt(offsetValue) : 0;
	}

	function smoothScroll(target, clickedElement) {
		const startPosition = window.pageYOffset;
		const offset = getOffset(clickedElement);
		const targetPosition = target.getBoundingClientRect().top + startPosition - offset;
		const distance = targetPosition - startPosition;
		let startTime = null;

		function animation(currentTime) {
			if (startTime === null) startTime = currentTime;
			const timeElapsed = currentTime - startTime;
			const progress = Math.min(timeElapsed / SCROLL_SETTINGS.duration, 1);
			const easeProgress = EASING_FUNCTIONS[SCROLL_SETTINGS.easing](progress);
			window.scrollTo(0, startPosition + distance * easeProgress);
			if (timeElapsed < SCROLL_SETTINGS.duration) requestAnimationFrame(animation);
		}

		requestAnimationFrame(animation);
	}

	function handleClick(e) {
		const href = e.currentTarget.getAttribute('href');
		if (href && href.startsWith('#')) {
			e.preventDefault();
			const target = document.getElementById(href.slice(1));
			if (target) smoothScroll(target, e.currentTarget);
		}
	}

	function handleHashChange() {
		if (window.location.hash) {
			const target = document.getElementById(window.location.hash.slice(1));
			if (target) {
				// For hash changes, use default offset of 0 since we don't have a clicked element
				setTimeout(() => {
					const startPosition = window.pageYOffset;
					const targetPosition = target.getBoundingClientRect().top + startPosition;
					const distance = targetPosition - startPosition;
					let startTime = null;

					function animation(currentTime) {
						if (startTime === null) startTime = currentTime;
						const timeElapsed = currentTime - startTime;
						const progress = Math.min(timeElapsed / SCROLL_SETTINGS.duration, 1);
						const easeProgress = EASING_FUNCTIONS[SCROLL_SETTINGS.easing](progress);
						window.scrollTo(0, startPosition + distance * easeProgress);
						if (timeElapsed < SCROLL_SETTINGS.duration) requestAnimationFrame(animation);
					}

					requestAnimationFrame(animation);
				}, 0);
			}
		}
	}

	function init() {
		// Find all elements with disable-smooth-scroll attribute
		document.querySelectorAll('[disable-smooth-scroll]').forEach(element => {
			const href = element.getAttribute('href');
			
			if (href && href.startsWith('#')) {
				// If element has href starting with #, add event listener to it
				element.addEventListener('click', handleClick);
			} else {
				// If element doesn't have href, add event listeners to anchor elements inside it
				element.querySelectorAll('a[href^="#"]').forEach(anchor => {
					anchor.addEventListener('click', handleClick);
				});
			}
		});
		
		window.addEventListener('hashchange', handleHashChange);
		handleHashChange(); // Handle initial hash on page load
	}

	document.addEventListener('DOMContentLoaded', init);
	window.Webflow && window.Webflow.push(init);
})();