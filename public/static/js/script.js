// Wrap everything in an IIFE to avoid polluting global scope
(function() {
    // Scoped variables
    let searchDropdown = null;
    // Inputs used by the location search and price estimate. Declared here so helper functions
    // defined in the outer scope can reference them safely; they'll be assigned on DOMContentLoaded.
    let serviceSelect = null;
    let locationInput = null;
    let startDateInput = null;
    let startTimeInput = null;
    let endDateInput = null;
    let endTimeInput = null;
    let priceDisplay = null;
    // Safe container helper: prefer .map-container if present, otherwise use document.body
    function getSafeContainer() {
        return document.querySelector('.map-container') || document.body;
    }

// Function to show error message
function showError(message) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    // Append to a safe container to avoid errors when .map-container is not present
    getSafeContainer().appendChild(errorMessage);

    // Remove error message after 5 seconds
    setTimeout(() => {
        errorMessage.remove();
    }, 5000);
}

// Function to create a search dropdown
function createSearchDropdown() {
    const dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown';
    return dropdown;
}

// Function to add search suggestions
function addSearchSuggestions(suggestions) {
    if (!searchDropdown) {
        searchDropdown = createSearchDropdown();
        getSafeContainer().appendChild(searchDropdown);
    }

    searchDropdown.innerHTML = '';
    suggestions.forEach(suggestion => {
        const option = document.createElement('div');
        option.className = 'search-option';
        option.textContent = suggestion.display_name;
        option.addEventListener('click', () => {
            locationInput.value = suggestion.display_name;
            searchDropdown.remove();
            searchDropdown = null;
        });
        searchDropdown.appendChild(option);
    });
}

// Function to search for locations
async function searchLocation() {
    const query = locationInput.value.trim();
    if (query.length < 3) return;

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=HK`);
        const results = await response.json();
        
        if (results.length > 0) {
            addSearchSuggestions(results);
        } else {
            showError(i18n.t('script.error.no_results'));
        }
    } catch (error) {
        console.error('Error searching location:', error);
        showError(i18n.t('script.error.search_location'));
    }
}

// Note: location input is initialized inside DOMContentLoaded for safety

// Initialize the DOM when loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM element references (assign to outer-scope vars)
    // Be robust: some templates use id="service-type" while others may use "service-select".
    serviceSelect = document.getElementById('service-select') || document.getElementById('service-type');
    locationInput = document.getElementById('location-input');
    startDateInput = document.getElementById('start-date');
    startTimeInput = document.getElementById('start-time');
    endDateInput = document.getElementById('end-date');
    endTimeInput = document.getElementById('end-time');
    priceDisplay = document.getElementById('price-display');

    // Add event listener for input changes
    if (locationInput) {
        // Restore saved location if any
        const savedLocation = sessionStorage.getItem('location');
        if (savedLocation) {
            locationInput.value = savedLocation;
        }

        // Store changes and search with debounce
        locationInput.addEventListener('input', (e) => {
            const location = e.target.value;
            sessionStorage.setItem('location', location);
        });

        locationInput.addEventListener('input', debounce(searchLocation, 300));
    } else {
        console.warn('Location input (#location-input) not found in DOM. Search features disabled.');
    }

    // Language selection
    function handleLanguageChange(e) {
        // Use currentTarget to ensure we reference the element the listener was attached to
        const opt = e.currentTarget || this;
        try { e.preventDefault(); } catch (err) { /* ignore */ }

        // Remove active class from all options and mark the selected one
        document.querySelectorAll('.language-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');

        // Resolve language code robustly: prefer data-lang attribute, else trimmed text
        const lang = (opt.dataset && opt.dataset.lang) ? opt.dataset.lang : (opt.textContent || opt.innerText || 'en').trim();

        // Persist selection and update document language attribute
        localStorage.setItem('selectedLanguage', lang);
        try { document.documentElement.lang = lang; } catch (err) { /* ignore */ }

        // Apply translations immediately (if i18n loaded). Guard in case of older cached JS.
        if (window.applyTranslations && typeof window.applyTranslations === 'function') {
            try { window.applyTranslations(lang); } catch (err) { console.error('applyTranslations failed', err); }
        } else {
            // If the i18n module is not present (cached page), try reloading the i18n script then apply.
            const existing = document.querySelector('script[src*="/static/js/i18n.js"]');
            if (!existing) {
                const s = document.createElement('script');
                s.src = (new URL('/static/js/i18n.js', window.location.origin)).toString() + '?v=' + Date.now();
                s.onload = () => { try { window.applyTranslations && window.applyTranslations(lang); } catch (e) { console.error(e); } };
                document.head.appendChild(s);
            }
        }
    }

    // Replace per-element listeners with delegated handling for robustness.
    // This handles click/touch/keyboard, toggles the dropdown, manages aria state,
    // and applies translations via the existing applyTranslations helper.
    const languageDropdown = document.getElementById('language-dropdown');
    const languageIcon = languageDropdown ? languageDropdown.querySelector('.language-icon') : null;

    function closeLanguageDropdown() {
        if (!languageDropdown) return;
        languageDropdown.classList.remove('open');
        if (languageIcon) languageIcon.setAttribute('aria-expanded', 'false');
    }

    function openLanguageDropdown() {
        if (!languageDropdown) return;
        languageDropdown.classList.add('open');
        if (languageIcon) languageIcon.setAttribute('aria-expanded', 'true');
    }

    function toggleLanguageDropdown() {
        if (!languageDropdown) return;
        if (languageDropdown.classList.contains('open')) closeLanguageDropdown(); else openLanguageDropdown();
    }

    // Hover handling: add a small delay on mouseleave to avoid flicker when moving
    // the pointer from the icon to the menu. Using JS-based open class ensures
    // consistent behavior across browsers and when :hover may be interrupted by
    // small layout shifts.
    if (languageDropdown) {
        let _hoverTimeout = null;
        languageDropdown.addEventListener('mouseenter', function () {
            if (_hoverTimeout) { clearTimeout(_hoverTimeout); _hoverTimeout = null; }
            languageDropdown.classList.add('open');
        });
        languageDropdown.addEventListener('mouseleave', function () {
            // Delay closing slightly to allow pointer to move into the dropdown
            _hoverTimeout = setTimeout(() => { languageDropdown.classList.remove('open'); _hoverTimeout = null; }, 150);
        });
    }

    function applyLanguageSelection(optEl) {
        if (!optEl) return;
        const lang = (optEl.dataset && optEl.dataset.lang) ? optEl.dataset.lang : (optEl.textContent || optEl.innerText || 'en').trim();
        // Mark active state
        document.querySelectorAll('.language-option').forEach(o => o.classList.remove('active'));
        optEl.classList.add('active');
        // Persist and apply
        localStorage.setItem('selectedLanguage', lang);
        try { document.documentElement.lang = lang; } catch (err) { /* ignore */ }
        if (window.applyTranslations && typeof window.applyTranslations === 'function') {
            try { window.applyTranslations(lang); } catch (err) { console.error('applyTranslations failed', err); }
        }
        // Close dropdown after selection for better UX
        closeLanguageDropdown();
    }

    // Delegated click handler on document to catch interactions even when elements
    // are re-rendered or moved in the DOM. Uses closest() so clicks on inner spans
    // still select the language option.
    document.addEventListener('click', function (e) {
        const clickedOption = e.target.closest && e.target.closest('.language-option');
        if (clickedOption) {
            try { e.preventDefault(); } catch (err) { /* ignore */ }
            applyLanguageSelection(clickedOption);
            return;
        }

        const clickedIcon = e.target.closest && e.target.closest('.language-icon');
        if (clickedIcon) {
            try { e.preventDefault(); } catch (err) { /* ignore */ }
            toggleLanguageDropdown();
            return;
        }

        // Click outside language dropdown closes it
        if (languageDropdown && !e.target.closest('.language-dropdown')) {
            closeLanguageDropdown();
        }
    });

    // Support keyboard navigation: Enter/Space to select focused option, Escape to close
    document.addEventListener('keydown', function (e) {
        const activeEl = document.activeElement;
        if (activeEl && activeEl.classList && activeEl.classList.contains('language-option')) {
            if (e.key === 'Enter' || e.key === ' ') {
                try { e.preventDefault(); } catch (err) { /* ignore */ }
                applyLanguageSelection(activeEl);
            }
        }
        if (e.key === 'Escape') {
            closeLanguageDropdown();
        }
    });

    // Touch support: open dropdown when tapping the language icon
    if (languageIcon) {
        languageIcon.addEventListener('touchstart', function (e) { try { e.preventDefault(); } catch (err) {} toggleLanguageDropdown(); }, { passive: false });
    }

    // Restore language selection from localStorage and apply translations
    const _storedLang = localStorage.getItem('selectedLanguage') || 'en';
    const _opt = document.querySelector(`.language-option[data-lang="${_storedLang}"]`);
    if (_opt) {
        document.querySelectorAll('.language-option').forEach(o => o.classList.remove('active'));
        _opt.classList.add('active');
    }
    if (window.applyTranslations) window.applyTranslations(_storedLang);

    // Runtime untranslated text detector (dev-only)
    // Enable by setting localStorage.setItem('i18n_debug','1') or adding ?i18n_debug=1 to the URL.
    function detectUntranslatedTextNodes() {
        try {
            const params = new URLSearchParams(window.location.search);
            const enabled = (localStorage && localStorage.getItem && localStorage.getItem('i18n_debug') === '1') || params.get('i18n_debug') === '1';
            if (!enabled) return;

            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
                acceptNode(node) {
                    if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
                    const txt = node.nodeValue.trim();
                    if (!txt) return NodeFilter.FILTER_REJECT;
                    // skip obvious tokens and short words
                    if (txt.length < 3) return NodeFilter.FILTER_REJECT;
                    // skip templating markers
                    if (/\{\{.*\}\}|\{%.*%\}/.test(txt)) return NodeFilter.FILTER_REJECT;
                    return NodeFilter.FILTER_ACCEPT;
                }
            });

            const found = new Map();
            let n;
            while ((n = walker.nextNode())) {
                const el = n.parentElement;
                if (!el) continue;
                // ignore if any ancestor has data-i18n annotation
                if (el.closest && el.closest('[data-i18n], [data-i18n-placeholder], [data-i18n-alt], [data-i18n-aria], [data-i18n-title], [data-i18n-value]')) continue;
                // ignore script/style/template/option elements
                const tag = el.tagName && el.tagName.toLowerCase();
                if (['script','style','template','option','noscript'].includes(tag)) continue;
                // ignore small numeric/content-only nodes
                const txt = n.nodeValue.trim();
                if (/^[\d\W]+$/.test(txt)) continue;

                // record unique occurrences (store sample outerHTML and trimmed text)
                if (!found.has(txt)) {
                    found.set(txt, {count:1, sample: el.outerHTML.replace(/\s+/g,' ').slice(0,200)});
                } else {
                    found.get(txt).count++;
                }
            }

            if (found.size === 0) {
                console.info('i18n-debug: no untranslated text nodes detected');
                return;
            }

            console.group('i18n-debug: untranslated text nodes (' + found.size + ')');
            found.forEach((v,k) => {
                console.log(`- "${k}" (count: ${v.count}) sample: ${v.sample}`);
            });
            console.groupEnd();
        } catch (e) {
            console.warn('i18n-debug failed', e);
        }
    }

    // Run detector shortly after translations applied so it reports remaining strings
    setTimeout(detectUntranslatedTextNodes, 400);

    // Debug badge removed in production: no DOM debug element injected

    // CSS-first, minimal JS hamburger menu handling
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    let mobileMenu = document.querySelector('.mobile-menu');

    // If the mobile menu exists inside a header or other container that may create a
    // stacking context, move it to be a direct child of <body> to guarantee z-index
    // ordering with the overlay/header. This avoids surprises from transforms/filters
    // on ancestor elements.
    if (mobileMenu && mobileMenu.parentElement !== document.body) {
        document.body.appendChild(mobileMenu);
        // re-query to ensure we have the updated reference (not strictly necessary but safe)
        mobileMenu = document.querySelector('.mobile-menu');
    }

    if (hamburgerBtn && mobileMenu) {
        let menuOverlay = null;

        function createMenuOverlay() {
            if (document.querySelector('.menu-overlay')) return;
            menuOverlay = document.createElement('div');
            menuOverlay.className = 'menu-overlay';
            menuOverlay.addEventListener('click', closeMobileMenu);
            document.body.appendChild(menuOverlay);
        }

        function openMobileMenu() {
            createMenuOverlay();
            document.body.classList.add('mobile-menu-is-open', 'body-no-scroll');
            hamburgerBtn.setAttribute('aria-expanded', 'true');
        }

        function closeMobileMenu() {
            document.body.classList.remove('mobile-menu-is-open', 'body-no-scroll');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
            // Remove the overlay element from the DOM to avoid accumulation
            if (menuOverlay) {
                try { menuOverlay.remove(); } catch (err) { /* ignore */ }
                menuOverlay = null;
            } else {
                // Defensive: if overlay exists but our reference is lost, remove any stray element
                const existing = document.querySelector('.menu-overlay');
                if (existing) existing.remove();
            }
        }

        function toggleMobileMenu(event) {
            // Only prevent default/stop propagation when the event originates from the
            // hamburger button (click or touchstart). This avoids blocking link
            // navigation inside the menu.
            if (event && (event.target === hamburgerBtn || event.currentTarget === hamburgerBtn)) {
                try {
                    event.preventDefault();
                } catch (err) {
                    // some passive touch listeners may throw; ignore
                }
                event.stopPropagation();
            }

            const isOpen = document.body.classList.contains('mobile-menu-is-open');
            if (isOpen) closeMobileMenu(); else openMobileMenu();
        }

        // Only stop propagation when clicking the menu backdrop itself — allow link clicks
        // and other child element events to proceed so navigation and form controls work.
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) e.stopPropagation();
        });

        // Support both click and touch on the hamburger button. Use non-passive touch handler
        // so toggleMobileMenu can call preventDefault if needed.
        hamburgerBtn.addEventListener('click', toggleMobileMenu);
        hamburgerBtn.addEventListener('touchstart', function (e) { toggleMobileMenu(e); }, { passive: false });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.body.classList.contains('mobile-menu-is-open')) {
                closeMobileMenu();
            }
        });

        // Close the mobile menu when a navigation link inside it is clicked so navigation
        // proceeds cleanly and the overlay/scroll lock are removed.
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                // Let navigation occur, but ensure the UI state is closed immediately.
                closeMobileMenu();
            });
        });
    }

    // Function to update price estimate
    function updatePriceEstimate() {
        // Guard: ensure priceDisplay exists
        if (!priceDisplay) return;

        // Check if all required fields have values
        const allFilled = serviceSelect && serviceSelect.value && 
                         locationInput && locationInput.value && 
                         startDateInput && startDateInput.value && 
                         startTimeInput && startTimeInput.value && 
                         endDateInput && endDateInput.value && 
                         endTimeInput && endTimeInput.value;

        if (!allFilled) {
            priceDisplay.textContent = i18n.t('script.error.fill_fields');
            return;
        }

        // Validate dates
        const startDate = new Date(startDateInput.value + 'T' + startTimeInput.value);
        const endDate = new Date(endDateInput.value + 'T' + endTimeInput.value);
        
        if (endDate <= startDate) {
            priceDisplay.textContent = i18n.t('script.error.end_date_after');
            return;
        }

        // Calculate price based on service type and duration
        const serviceType = serviceSelect ? serviceSelect.value : '';
        const duration = (endDate - startDate) / (1000 * 60 * 60); // Duration in hours

        // Base prices (in HKD) fallback for the services present in the UI
        const basePrices = {
            'foodservice': 2000,
            'parties': 1500,
            'hospitality': 1800,
            'companion': 1200,
            'assistant': 1000,
            'loading': 900,
            'elderly': 2200,
            'variety': 2500,
            'other': 1000
        };

        // Prefer price set on the option element (data-price) so pricing is data-driven.
        let price = 1000; // default
        if (serviceSelect) {
            const opt = serviceSelect.querySelector(`option[value="${serviceType}"]`);
            if (opt && opt.dataset && opt.dataset.price) {
                const parsed = parseFloat(opt.dataset.price);
                if (!Number.isNaN(parsed)) price = parsed;
            } else {
                price = basePrices[serviceType] || 1000;
            }
        }

        // Add time-based incremental fee (HKD 10 per hour after first hour)
        price += Math.max(0, duration - 1) * 10;

        // Apply location-based surcharge
        const location = locationInput.value.toLowerCase();
        if (location.includes('airport')) {
            price += 50; // Airport surcharge
        }

        // Format and display price
        priceDisplay.textContent = `${i18n.t('script.price.estimated')} ${price.toFixed(2)}`;
    }

    // Debounce function for input events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize price update
    updatePriceEstimate();

    // Add event listeners for price update (only for existing elements)
    [serviceSelect, locationInput, startDateInput, startTimeInput, endDateInput, endTimeInput].forEach(input => {
        if (input) input.addEventListener('change', updatePriceEstimate);
    });
    
    // Expose nothing to global scope; keep module self-contained.
    });

})();