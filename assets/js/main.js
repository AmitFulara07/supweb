document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect
    const header = document.querySelector('.site-header');
    const scrollThreshold = 50;

    const handleScroll = () => {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // 2. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');

            // Prevent scrolling when menu is open
            if (navMenu.classList.contains('active')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        });

        // Close menu when clicking a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                body.style.overflow = '';
            });
        });
    }

    // 3. Scroll Animations (Intersection Observer)
    const fadeElements = document.querySelectorAll('.fade-up');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing once animated to play only once
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));

    // 4. Split Hero Hover Effects (Homepage specific)
    const splitSections = document.querySelectorAll('.split-section');
    if (splitSections.length === 2) {
        splitSections.forEach(section => {
            section.addEventListener('mouseenter', () => {
                // When hovering one, expand it, shrink the other
                section.style.flex = '1.5';
                const other = Array.from(splitSections).find(s => s !== section);
                if (other) other.style.flex = '0.5';
            });

            section.addEventListener('mouseleave', () => {
                // Reset
                splitSections.forEach(s => s.style.flex = '1');
            });
        });
    }

    // 5. Portfolio Filtering (Portfolio page specific)
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    let isFiltering = false; // Flag to prevent rapid clicking desync

    if (filterBtns.length > 0 && portfolioItems.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (isFiltering) return;
                isFiltering = true;

                // Remove active class from all
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add to clicked
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                portfolioItems.forEach(item => {
                    if (filterValue === 'all' || item.classList.contains(filterValue)) {
                        item.style.display = 'block';
                        // Small force reflow to ensure display block is recognized before opacity transition
                        void item.offsetWidth;
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';
                        // Wait for transition to finish before hiding display
                        setTimeout(() => {
                            if (!btn.classList.contains('active')) return; // Abort if another filter was somehow clicked
                            item.style.display = 'none';
                        }, 400); // slightly longer than CSS transition normal
                    }
                });

                // Unlock filter clicking after transitions complete
                setTimeout(() => {
                    isFiltering = false;
                }, 450);
            });
        });

        // Initialize the default active filter on page load
        const defaultFilter = document.querySelector('.filter-btn.active');
        if (defaultFilter) {
            // Slight delay ensures layout readiness
            setTimeout(() => {
                defaultFilter.click();
            }, 50);
        }
    }
});
