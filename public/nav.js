// nav.js - Professional navigation system with proper page routing
class Navigation {
    constructor() {
        this.isMobile = window.innerWidth < 900;
        this.scrollThreshold = 100;
        this.closeDelay = 150;
        this.init();
    }

    init() {
        this.setupStickyHeader();
        this.setupDropdowns();
        this.setupMobileMenu();
        this.setupKeyboardNavigation();
        this.setupClickOutside();
        this.setupActivePage();
    }

    // Set active page based on current URL
    setupActivePage() {
        const currentPage = this.getCurrentPage();
        this.highlightActiveNav(currentPage);
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        
        // Map pages to navigation items
        const pageMap = {
            'index.html': 'home',
            'sportsCard.html': 'football',
            'sportsCard.html': 'cricket',
            'sportsCard.html': 'basketball',
            'sportsCard.html': 'tennis',
            'sportsCard.html': 'baseball',
            'sportsCard.html': 'hockey',
            'sportsCard.html': 'golf',
            'sportsCard.html': 'rugby',
            'sportsCard.html': 'f1',
            'sportsCard.html': 'boxing',
            'sportsCard.html': 'mma',
            'sportsCard.html': 'olympics'
        };

        return pageMap[page] || 'home';
    }

    highlightActiveNav(currentPage) {
        // Remove active class from all nav links
        const allNavLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
        allNavLinks.forEach(link => {
            link.classList.remove('nav-active', 'mobile-nav-active');
            link.removeAttribute('aria-current');
        });

        // Add active class to current page
        if (currentPage === 'home') {
            const homeLink = document.querySelector('[href="index.html"]');
            if (homeLink) {
                homeLink.classList.add('nav-active', 'mobile-nav-active');
                homeLink.setAttribute('aria-current', 'page');
            }
        } else {
            // For sport pages, highlight the sports dropdown and the specific sport in mobile
            const sportsButton = document.querySelector('.nav-button');
            if (sportsButton) {
                sportsButton.classList.add('nav-active');
            }
            
            // Also highlight if there's a direct link to this sport
            const sportLink = document.querySelector(`[href="sports/${currentPage}.html"]`);
            if (sportLink) {
                sportLink.classList.add('nav-active', 'mobile-nav-active');
                sportLink.setAttribute('aria-current', 'page');
            }
        }
    }

    // Sticky header with compact mode
    setupStickyHeader() {
        const header = document.getElementById('siteHeader');
        let ticking = false;

        const updateHeader = () => {
            const scrolled = window.pageYOffset > this.scrollThreshold;
            header.classList.toggle('header--compact', scrolled);
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    // Desktop dropdown functionality
    setupDropdowns() {
        const dropdowns = document.querySelectorAll('.has-dropdown');
        
        dropdowns.forEach(dropdown => {
            const button = dropdown.querySelector('.nav-button');
            const menu = dropdown.querySelector('.dropdown');
            let closeTimeout;

            // Mouse events for desktop
            dropdown.addEventListener('mouseenter', () => {
                if (this.isMobile) return;
                this.openDropdown(button, menu);
                clearTimeout(closeTimeout);
            });

            dropdown.addEventListener('mouseleave', () => {
                if (this.isMobile) return;
                closeTimeout = setTimeout(() => {
                    this.closeDropdown(button, menu);
                }, this.closeDelay);
            });

            // Click events for mobile/touch
            button.addEventListener('click', (e) => {
                if (!this.isMobile) return;
                e.preventDefault();
                e.stopPropagation();
                
                const isExpanded = button.getAttribute('aria-expanded') === 'true';
                if (isExpanded) {
                    this.closeDropdown(button, menu);
                } else {
                    this.openDropdown(button, menu);
                }
            });

            // Prevent menu close when hovering over menu
            menu.addEventListener('mouseenter', () => {
                clearTimeout(closeTimeout);
            });

            menu.addEventListener('mouseleave', () => {
                closeTimeout = setTimeout(() => {
                    this.closeDropdown(button, menu);
                }, this.closeDelay);
            });

            // Handle clicks on dropdown items
            menu.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    this.closeDropdown(button, menu);
                }
            });
        });
    }

    // Mobile menu functionality
    setupMobileMenu() {
        const mobileToggle = document.getElementById('mobileToggle');
        const mobileMenu = document.getElementById('mobileMenu');

        mobileToggle.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Close mobile menu when clicking links (handled in HTML onclick)
    }

    // Keyboard navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Escape key closes dropdowns and mobile menu
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
                this.closeMobileMenu();
            }

            // Tab key management
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    }

    // Click outside to close
    setupClickOutside() {
        document.addEventListener('click', (e) => {
            if (this.isMobile) return;
            
            const dropdowns = document.querySelectorAll('.has-dropdown[aria-expanded="true"]');
            dropdowns.forEach(dropdown => {
                if (!dropdown.contains(e.target)) {
                    const button = dropdown.querySelector('.nav-button');
                    const menu = dropdown.querySelector('.dropdown');
                    this.closeDropdown(button, menu);
                }
            });
        });
    }

    // Dropdown management
    openDropdown(button, menu) {
        this.closeAllDropdowns(); // Close other dropdowns first
        
        button.setAttribute('aria-expanded', 'true');
        menu.setAttribute('aria-hidden', 'false');
        
        const dropdown = button.closest('.has-dropdown');
        dropdown.setAttribute('aria-expanded', 'true');
    }

    closeDropdown(button, menu) {
        button.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        
        const dropdown = button.closest('.has-dropdown');
        dropdown.setAttribute('aria-expanded', 'false');
    }

    closeAllDropdowns() {
        const dropdowns = document.querySelectorAll('.has-dropdown[aria-expanded="true"]');
        dropdowns.forEach(dropdown => {
            const button = dropdown.querySelector('.nav-button');
            const menu = dropdown.querySelector('.dropdown');
            this.closeDropdown(button, menu);
        });
    }

    // Mobile menu management
    toggleMobileMenu() {
        const mobileToggle = document.getElementById('mobileToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        const mobileToggle = document.getElementById('mobileToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        
        mobileToggle.setAttribute('aria-expanded', 'true');
        mobileMenu.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Trap focus in mobile menu
        this.trapFocus(mobileMenu);
    }

    closeMobileMenu() {
        const mobileToggle = document.getElementById('mobileToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        // Close all mobile dropdowns
        this.closeAllMobileDropdowns();
    }

    // Mobile dropdown functionality
    toggleMobileDropdown(button) {
        const dropdown = button.parentElement;
        const menu = dropdown.querySelector('.mobile-dropdown-menu');
        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
            this.closeMobileDropdown(button, menu);
        } else {
            this.openMobileDropdown(button, menu);
        }
    }

    openMobileDropdown(button, menu) {
        button.setAttribute('aria-expanded', 'true');
        menu.setAttribute('aria-hidden', 'false');
    }

    closeMobileDropdown(button, menu) {
        button.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
    }

    closeAllMobileDropdowns() {
        const dropdowns = document.querySelectorAll('.mobile-dropdown[aria-expanded="true"]');
        dropdowns.forEach(dropdown => {
            const button = dropdown.querySelector('.mobile-nav-button');
            const menu = dropdown.querySelector('.mobile-dropdown-menu');
            this.closeMobileDropdown(button, menu);
        });
    }

    // Focus management
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeydown = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        element.addEventListener('keydown', handleKeydown);
        firstElement.focus();

        // Cleanup function
        return () => {
            element.removeEventListener('keydown', handleKeydown);
        };
    }

    handleTabNavigation(e) {
        // Handle tab navigation within dropdowns
        const activeDropdown = document.querySelector('.has-dropdown[aria-expanded="true"]');
        if (activeDropdown) {
            const dropdownItems = activeDropdown.querySelectorAll('.dropdown-item');
            const firstItem = dropdownItems[0];
            const lastItem = dropdownItems[dropdownItems.length - 1];

            if (e.shiftKey && document.activeElement === firstItem) {
                e.preventDefault();
                activeDropdown.querySelector('.nav-button').focus();
            } else if (!e.shiftKey && document.activeElement === lastItem) {
                e.preventDefault();
                // Focus will move to next element after dropdown
            }
        }
    }

    // Handle window resize
    handleResize() {
        this.isMobile = window.innerWidth < 900;
        
        // Reset mobile menu state on desktop
        if (!this.isMobile) {
            this.closeMobileMenu();
            this.closeAllDropdowns();
        }
    }
}

// Global functions for HTML event handlers
function setActiveNav(section) {
    // This function is now handled automatically by the Navigation class
    console.log('Navigation to:', section);
}

function toggleMobileDropdown(button) {
    window.navigation.toggleMobileDropdown(button);
}

function closeMobileMenu() {
    window.navigation.closeMobileMenu();
}

function openLogin() {
    alert('Login functionality would open here');
}

function subscribe() {
    const email = document.getElementById('nlEmail');
    if (email && email.value) {
        alert(`Thank you for subscribing with: ${email.value}`);
        email.value = '';
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigation = new Navigation();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        window.navigation.handleResize();
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileToggle = document.getElementById('mobileToggle');
    
    if (mobileMenu && !mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        if (mobileMenu.getAttribute('aria-hidden') === 'false') {
            window.navigation.closeMobileMenu();
        }
    }
});