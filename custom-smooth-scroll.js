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
		easeOutCubic: t => (t - 1) * (t - 1) * (t - 1) + 1,
		easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
	};

	let activeAnimationId = null;

	function log(...args) {
		if (SCROLL_SETTINGS.debug) console.log('[smooth-scroll]', ...args);
	}

	function getOffset(clickedElement) {
		let offset = 0;

		// Dynamic part: height of the specified element (e.g. sticky header)
		const byElement = clickedElement && clickedElement.closest('[custom-scroll-offset-by]');
		if (byElement) {
			const selector = byElement.getAttribute('custom-scroll-offset-by');
			const offsetTarget = document.querySelector(selector);
			const height = offsetTarget ? Math.round(offsetTarget.getBoundingClientRect().height) : 0;
			log(`offset-by: "${selector}" → ${offsetTarget ? `found, height: ${height}px` : 'element not found'}`);
			offset += height;
		} else {
			// Auto-detect sticky headers via [n-header] and [header] attributes
			const autoHeaders = document.querySelectorAll('[n-header], [header]');
			autoHeaders.forEach(el => {
				const height = Math.round(el.getBoundingClientRect().height);
				log(`auto header offset: <${el.tagName.toLowerCase()}> height: ${height}px`);
				offset += height;
			});
		}

		// Static part: additional fixed pixel value added on top
		const staticElement = clickedElement && clickedElement.closest('[custom-scroll-offset]');
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
		// Cancel any running animation
		if (activeAnimationId) {
			cancelAnimationFrame(activeAnimationId);
			activeAnimationId = null;
		}

		const startPosition = window.scrollY;
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

			if (progress < 1) {
				activeAnimationId = requestAnimationFrame(animation);
			} else {
				// Ensure final position is exact
				window.scrollTo(0, targetPosition);
				activeAnimationId = null;
			}
		}

		activeAnimationId = requestAnimationFrame(animation);
	}

	function handleClick(e) {
		const anchor = e.target.closest('a[href^="#"]');
		if (!anchor) return;

		const href = anchor.getAttribute('href');
		if (!href || href === '#') return;

		e.preventDefault();
		const target = document.getElementById(href.slice(1));
		if (target) smoothScroll(target, anchor);
	}

	function handleHashChange() {
		if (window.location.hash && window.location.hash !== '#') {
			const target = document.getElementById(window.location.hash.slice(1));
			if (target) {
				setTimeout(() => smoothScroll(target, null), 0);
			}
		}
	}

	let initialized = false;

	function init() {
		if (initialized) return;
		initialized = true;

		// Use event delegation to support dynamically added elements
		document.addEventListener('click', handleClick);

		window.addEventListener('hashchange', handleHashChange);
		handleHashChange(); // Handle initial hash on page load
	}

	document.addEventListener('DOMContentLoaded', init);
	window.Webflow && window.Webflow.push(init);
})();
