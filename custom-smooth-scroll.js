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
		easing: 'easeInOutCubic', // 'linear', 'easeInQuad', 'easeOutQuad', 'easeInOutQuad', 'easeInCubic', 'easeOutCubic', 'easeInOutCubic'
		debug: false
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

	function log(...args) {
		if (SCROLL_SETTINGS.debug) console.log('[smooth-scroll]', ...args);
	}

	function getOffset(clickedElement) {
		let offset = 0;

		// Dynamic part: height of the specified element (e.g. sticky header)
		const byElement = clickedElement.closest('[custom-scroll-offset-by]');
		if (byElement) {
			const selector = byElement.getAttribute('custom-scroll-offset-by');
			const offsetTarget = document.querySelector(selector);
			const height = offsetTarget ? Math.round(offsetTarget.getBoundingClientRect().height) : 0;
			log(`offset-by: "${selector}" → ${offsetTarget ? `found, height: ${height}px` : 'element not found'}`);
			offset += height;
		}

		// Static part: additional fixed pixel value added on top
		const staticElement = clickedElement.closest('[custom-scroll-offset]');
		if (staticElement) {
			const offsetValue = staticElement.getAttribute('custom-scroll-offset');
			const parsed = offsetValue && !isNaN(parseInt(offsetValue)) ? parseInt(offsetValue) : 0;
			log(`offset: +${parsed}px (static)`);
			offset += parsed;
		}

		log(`total offset: ${offset}px`);
		return offset;
	}

	function smoothScroll(target, clickedElement) {
		const startPosition = window.pageYOffset;
		const offset = getOffset(clickedElement);
		const targetPosition = target.getBoundingClientRect().top + startPosition - offset;
		const distance = targetPosition - startPosition;
		log(`scrolling to #${target.id} | from: ${Math.round(startPosition)}px | target: ${Math.round(targetPosition)}px | distance: ${Math.round(distance)}px | offset: ${offset}px`);
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
		// Apply smooth scroll to all anchor links
		document.querySelectorAll('a[href^="#"]').forEach(anchor => {
			anchor.addEventListener('click', handleClick);
		});

		window.addEventListener('hashchange', handleHashChange);
		handleHashChange(); // Handle initial hash on page load
	}

	document.addEventListener('DOMContentLoaded', init);
	window.Webflow && window.Webflow.push(init);
})();