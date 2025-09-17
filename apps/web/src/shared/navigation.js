/**
 * Shared Navigation Component Loader
 * Epic 9: Information Architecture Restructure
 */

class SharedNavigation {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.init();
    }

    detectCurrentPage() {
        const path = window.location.pathname;

        // Map URLs to navigation IDs
        const pageMapping = {
            '/': 'overall-dashboard',
            '/index.html': 'overall-dashboard',
            '/opportunities-dashboard-enterprise.html': 'opportunities-dashboard',
            '/partnerships-dashboard-enterprise.html': 'partnerships-dashboard',
            '/financial-dashboard-enterprise.html': 'financial-dashboard',
            '/opportunities-enterprise.html': 'opportunity-management',
            '/partnership-manager-enterprise.html': 'partnership-management',
            '/user-management-enterprise.html': 'user-management'
        };

        return pageMapping[path] || 'overall-dashboard';
    }

    async init() {
        try {
            // Load the shared navigation HTML
            const response = await fetch('/src/shared/navigation.html');
            const navigationHTML = await response.text();

            // Find the navigation container and replace it
            const existingNav = document.querySelector('.app-sidebar');
            if (existingNav) {
                existingNav.outerHTML = navigationHTML;
                this.setActiveState();
                this.bindEvents();
            }
        } catch (error) {
            console.warn('Could not load shared navigation:', error);
        }
    }

    setActiveState() {
        // Remove any existing active states
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('nav-item--active');
            item.removeAttribute('aria-current');
        });

        // Set active state for current page
        const activeItem = document.querySelector(`[data-nav="${this.currentPage}"]`);
        if (activeItem) {
            activeItem.classList.add('nav-item--active');
            activeItem.setAttribute('aria-current', 'page');
        }
    }

    bindEvents() {
        // Handle sidebar toggle if it exists
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function() {
                const sidebar = document.querySelector('.app-sidebar');
                const isExpanded = this.getAttribute('aria-expanded') === 'true';

                sidebar.classList.toggle('app-sidebar--collapsed');
                this.setAttribute('aria-expanded', !isExpanded);
            });
        }

        // Handle placeholder navigation items
        document.querySelectorAll('.nav-item[href="#"]').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const text = this.textContent.trim();
                if (window.showNotification) {
                    window.showNotification(`${text} - Coming soon!`);
                } else {
                    alert(`${text} - Coming soon!`);
                }
            });
        });
    }
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new SharedNavigation());
} else {
    new SharedNavigation();
}

// Export for manual initialization if needed
window.SharedNavigation = SharedNavigation;