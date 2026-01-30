/**
 * Metro Car Brokers - JavaScript
 * Plain vanilla JS, no dependencies
 */

(function() {
    'use strict';

    // ==========================================================================
    // DOM Elements
    // ==========================================================================

    const header = document.getElementById('header');
    const nav = document.getElementById('nav');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileStickyBar = document.getElementById('mobile-sticky-bar');
    const hero = document.getElementById('hero');
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');
    const faqFilters = document.querySelectorAll('.faq-filter');
    const faqItems = document.querySelectorAll('.faq-item');
    const serviceButtons = document.querySelectorAll('[data-service]');
    const serviceSelect = document.getElementById('service');

    // ==========================================================================
    // Mobile Menu
    // ==========================================================================

    function initMobileMenu() {
        if (!mobileMenuBtn || !nav) return;

        mobileMenuBtn.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            nav.classList.toggle('open');

            // Prevent body scroll when menu is open
            document.body.style.overflow = isExpanded ? '' : 'hidden';
        });

        // Close menu when clicking a nav link
        nav.querySelectorAll('.nav-link').forEach(function(link) {
            link.addEventListener('click', function() {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                nav.classList.remove('open');
                document.body.style.overflow = '';
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('open')) {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                nav.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

    // ==========================================================================
    // Header Scroll Effects
    // ==========================================================================

    function initHeaderScroll() {
        if (!header) return;

        let lastScrollY = window.scrollY;
        let ticking = false;

        function updateHeader() {
            const scrollY = window.scrollY;

            // Add shadow when scrolled
            if (scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            lastScrollY = scrollY;
            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });
    }

    // ==========================================================================
    // Mobile Sticky Bar
    // ==========================================================================

    function initMobileStickyBar() {
        if (!mobileStickyBar || !hero) return;

        // Only show on mobile
        function checkViewport() {
            return window.innerWidth < 1024;
        }

        let ticking = false;

        function updateStickyBar() {
            if (!checkViewport()) {
                mobileStickyBar.classList.remove('visible');
                mobileStickyBar.setAttribute('aria-hidden', 'true');
                return;
            }

            const heroBottom = hero.getBoundingClientRect().bottom;

            if (heroBottom < 0) {
                mobileStickyBar.classList.add('visible');
                mobileStickyBar.setAttribute('aria-hidden', 'false');
            } else {
                mobileStickyBar.classList.remove('visible');
                mobileStickyBar.setAttribute('aria-hidden', 'true');
            }

            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(updateStickyBar);
                ticking = true;
            }
        }, { passive: true });

        window.addEventListener('resize', updateStickyBar, { passive: true });
    }

    // ==========================================================================
    // Smooth Scroll
    // ==========================================================================

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');

                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (!target) return;

                e.preventDefault();

                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update URL without scrolling
                history.pushState(null, '', targetId);
            });
        });
    }

    // ==========================================================================
    // Service Selection
    // ==========================================================================

    function initServiceSelection() {
        if (!serviceSelect) return;

        serviceButtons.forEach(function(button) {
            button.addEventListener('click', function(e) {
                const service = this.getAttribute('data-service');
                if (service && serviceSelect) {
                    // Set the service dropdown value
                    serviceSelect.value = service;

                    // Store for when we scroll to form
                    sessionStorage.setItem('selectedService', service);
                }
            });
        });

        // Check if there's a stored service selection
        const storedService = sessionStorage.getItem('selectedService');
        if (storedService) {
            serviceSelect.value = storedService;
            sessionStorage.removeItem('selectedService');
        }
    }

    // ==========================================================================
    // FAQ Filters
    // ==========================================================================

    function initFaqFilters() {
        if (!faqFilters.length || !faqItems.length) return;

        faqFilters.forEach(function(filter) {
            filter.addEventListener('click', function() {
                const category = this.getAttribute('data-filter');

                // Update active state
                faqFilters.forEach(function(f) {
                    f.classList.remove('active');
                    f.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');

                // Filter items
                faqItems.forEach(function(item) {
                    const itemCategory = item.getAttribute('data-category');

                    if (category === 'all' || itemCategory === category) {
                        item.hidden = false;
                    } else {
                        item.hidden = true;
                        // Close any open items that are being hidden
                        item.removeAttribute('open');
                    }
                });
            });
        });
    }

    // ==========================================================================
    // Form Validation & Submission
    // ==========================================================================

    function initContactForm() {
        if (!contactForm) return;

        // Validation rules
        const validators = {
            name: {
                validate: function(value) {
                    return value.trim().length >= 2;
                },
                message: 'Please enter your name'
            },
            mobile: {
                validate: function(value) {
                    // Australian mobile: starts with 04 or +614, 10 digits
                    const cleaned = value.replace(/[\s\-\(\)]/g, '');
                    return /^(\+?61|0)4\d{8}$/.test(cleaned);
                },
                message: 'Please enter a valid Australian mobile number'
            },
            email: {
                validate: function(value) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                },
                message: 'Please enter a valid email address'
            },
            service: {
                validate: function(value) {
                    return value !== '';
                },
                message: 'Please select a service'
            }
        };

        // Validate single field
        function validateField(field) {
            const name = field.name;
            const value = field.value;
            const errorEl = document.getElementById(name + '-error');
            const validator = validators[name];

            if (!validator) return true;

            const isValid = validator.validate(value);

            if (isValid) {
                field.classList.remove('error');
                if (errorEl) errorEl.textContent = '';
            } else {
                field.classList.add('error');
                if (errorEl) errorEl.textContent = validator.message;
            }

            return isValid;
        }

        // Validate all fields
        function validateForm() {
            let isValid = true;

            Object.keys(validators).forEach(function(name) {
                const field = contactForm.elements[name];
                if (field && !validateField(field)) {
                    isValid = false;
                }
            });

            return isValid;
        }

        // Add blur validation
        Object.keys(validators).forEach(function(name) {
            const field = contactForm.elements[name];
            if (field) {
                field.addEventListener('blur', function() {
                    validateField(this);
                });

                // Clear error on input
                field.addEventListener('input', function() {
                    if (this.classList.contains('error')) {
                        validateField(this);
                    }
                });
            }
        });

        // Form submission
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            if (!validateForm()) {
                // Focus first error field
                const firstError = contactForm.querySelector('.error');
                if (firstError) {
                    firstError.focus();
                }
                return;
            }

            // Collect form data
            const formData = new FormData(contactForm);
            const data = {};
            formData.forEach(function(value, key) {
                data[key] = value;
            });

            // Log form data (for development)
            console.log('Form submitted:', data);

            // In production, you would send this to your backend or Formspree/Zapier
            // Example:
            // fetch('https://formspree.io/f/yourformid', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(data)
            // });

            // Show success message
            contactForm.hidden = true;
            formSuccess.hidden = false;

            // Scroll to success message
            formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    // ==========================================================================
    // Reviews Carousel (Mobile)
    // ==========================================================================

    function initReviewsCarousel() {
        const carousel = document.getElementById('reviews-carousel');
        if (!carousel) return;

        // Touch/swipe support is handled by CSS scroll-snap
        // This adds optional arrow key navigation

        carousel.addEventListener('keydown', function(e) {
            const scrollAmount = 320; // Approximate card width + gap

            if (e.key === 'ArrowRight') {
                carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            } else if (e.key === 'ArrowLeft') {
                carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
        });
    }

    // ==========================================================================
    // Initialize
    // ==========================================================================

    function init() {
        initMobileMenu();
        initHeaderScroll();
        initMobileStickyBar();
        initSmoothScroll();
        initServiceSelection();
        initFaqFilters();
        initContactForm();
        initReviewsCarousel();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
