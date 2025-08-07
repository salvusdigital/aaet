/**
 * Shared Utilities for Admin Dashboard
 * 
 * This file contains common functionality used across all admin pages:
 * - Authentication management
 * - API communication
 * - Navigation handling
 * - Notification system
 * - DOM utilities
 * - Configuration management
 * 
 * @author Your Name
 * @version 1.0
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    API_URL: 'https://menu.aaentertainment.ng/api',
    CURRENCY_FORMAT: {
        locale: 'en-NG',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    },
    NAVIGATION_PATHS: {
        'categories': 'categories.html',
        'settings': 'settings.html',
        'menu-items': 'dashboard.html'
    },
    NOTIFICATION_TIMEOUTS: {
        SUCCESS: 3000,
        ERROR: 5000
    }
};

// ============================================================================
// AUTHENTICATION MANAGER
// ============================================================================

class AuthManager {
    constructor() {
        this.token = localStorage.getItem('adminToken');
        this.isAuthenticated = !!this.token;
    }

    /**
     * Check if user is authenticated and redirect if not
     * @returns {boolean} True if authenticated
     */
    checkAuth() {
        if (!this.token) {
            this.redirectToLogin();
            return false;
        }
        return true;
    }

    /**
     * Get the current authentication token
     * @returns {string|null} The authentication token
     */
    getToken() {
        return this.token;
    }

    /**
     * Logout user and redirect to login
     */
    logout() {
        localStorage.removeItem('adminToken');
        this.token = null;
        this.isAuthenticated = false;
        this.redirectToLogin();
    }

    /**
     * Redirect to login page
     */
    redirectToLogin() {
        window.location.href = 'login.html';
    }

    /**
     * Set authentication token
     * @param {string} token - The authentication token
     */
    setToken(token) {
        this.token = token;
        this.isAuthenticated = !!token;
        localStorage.setItem('adminToken', token);
    }
}

// ============================================================================
// API SERVICE
// ============================================================================

class APIService {
    constructor(authManager) {
        this.auth = authManager;
    }

    /**
     * Make an authenticated API request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Response>} API response
     */
    async request(endpoint, options = {}) {
        const requestId = this.generateRequestId();
        const url = `${CONFIG.API_URL}${endpoint}`;

        if (!this.auth) {
            throw new Error('Authentication service is not available');
        }

        // Get the token safely
        const token = this.auth.getToken ? this.auth.getToken() : null;
        if (!token) {
            this.auth.redirectToLogin();
            throw new Error('Authentication required');
        }
        
        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'X-Request-ID': requestId,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            // Handle authentication errors
            if (response.status === 401) {
                this.auth.logout();
                throw new Error('Authentication failed');
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Make a GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Additional fetch options
     * @returns {Promise<Object>} JSON response
     */
    async get(endpoint, options = {}) {
        try {
            const response = await this.request(endpoint, { method: 'GET', ...options });
            
            // Handle 400 errors
            if (response.status === 400) {
                const errorData = await response.json().catch(() => ({}));
                
                // Handle invalid tokens by clearing and redirecting
                if (errorData.error === 'Invalid token') {
                    localStorage.removeItem('adminToken');
                    window.location.href = 'login.html';
                }
                
                throw new Error(errorData.message || 'Bad request');
            }
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Make a POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body data
     * @param {Object} options - Additional fetch options
     * @returns {Promise<Object>} JSON response
     */
    async post(endpoint, data = {}, options = {}) {
        const response = await this.request(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify(data),
            ...options
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `POST request failed: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Make a PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body data
     * @param {Object} options - Additional fetch options
     * @returns {Promise<Object>} JSON response
     */
    async put(endpoint, data = {}, options = {}) {
        const response = await this.request(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify(data),
            ...options
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `PUT request failed: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Make a DELETE request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Additional fetch options
     * @returns {Promise<void>}
     */
    async delete(endpoint, options = {}) {
        const response = await this.request(endpoint, { method: 'DELETE', ...options });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `DELETE request failed: ${response.status}`);
        }
    }

    /**
     * Generate a unique request ID
     * @returns {string} Unique request ID
     */
    generateRequestId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }
}

// ============================================================================
// NOTIFICATION MANAGER
// ============================================================================

class NotificationManager {
    /**
     * Show an error notification
     * @param {string} message - Error message
     * @param {number} timeout - Timeout in milliseconds (optional)
     */
    static showError(message, timeout = CONFIG.NOTIFICATION_TIMEOUTS.ERROR) {
        this.showNotification(message, 'error', '#dc3545', timeout);
    }

    /**
     * Show a success notification
     * @param {string} message - Success message
     * @param {number} timeout - Timeout in milliseconds (optional)
     */
    static showSuccess(message, timeout = CONFIG.NOTIFICATION_TIMEOUTS.SUCCESS) {
        this.showNotification(message, 'success', '#28a745', timeout);
    }

    /**
     * Show a warning notification
     * @param {string} message - Warning message
     * @param {number} timeout - Timeout in milliseconds (optional)
     */
    static showWarning(message, timeout = CONFIG.NOTIFICATION_TIMEOUTS.ERROR) {
        this.showNotification(message, 'warning', '#ffc107', timeout);
    }

    /**
     * Show a notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type
     * @param {string} backgroundColor - Background color
     * @param {number} timeout - Timeout in milliseconds
     */
    static showNotification(message, type, backgroundColor, timeout) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getIconForType(type)}"></i>
            <span>${message}</span>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${backgroundColor};
            color: white;
            padding: 1rem;
            border-radius: 4px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 400px;
            word-wrap: break-word;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, timeout);
    }

    /**
     * Get icon for notification type
     * @param {string} type - Notification type
     * @returns {string} Icon class name
     */
    static getIconForType(type) {
        const icons = {
            'error': 'exclamation-circle',
            'success': 'check-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// ============================================================================
// NAVIGATION MANAGER
// ============================================================================

class NavigationManager {
    /**
     * Setup navigation event listeners
     * @param {NodeList} navLinks - Navigation link elements
     */
    static setup(navLinks) {
        if (!navLinks || navLinks.length === 0) {
            console.warn('[NavigationManager] No navigation links found');
            return;
        }

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                if (section) {
                    this.navigateToSection(section);
                }
            });
        });
    }

    /**
     * Navigate to a specific section
     * @param {string} section - Section to navigate to
     */
    static navigateToSection(section) {
        const path = CONFIG.NAVIGATION_PATHS[section];
        if (path) {
            window.location.href = path;
        } else {
            console.warn(`[NavigationManager] Unknown section: ${section}`);
        }
    }

    /**
     * Get current page name
     * @returns {string} Current page name
     */
    static getCurrentPage() {
        return window.location.pathname.split('/').pop() || 'dashboard.html';
    }
}

// ============================================================================
// DOM UTILITIES
// ============================================================================

class DOMUtils {
    /**
     * Cache DOM elements for better performance
     * @param {Array<string>} elementIds - Array of element IDs to cache
     * @returns {Object} Object with cached elements
     */
    static cacheElements(elementIds) {
        const elements = {};
        elementIds.forEach(id => {
            elements[id] = document.getElementById(id);
        });
        return elements;
    }

    /**
     * Show a modal with animation
     * @param {HTMLElement} modal - Modal element
     */
    static showModal(modal) {
        if (!modal) return;

        modal.style.display = 'block';
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
    }

    /**
     * Hide a modal with animation
     * @param {HTMLElement} modal - Modal element
     * @param {Function} callback - Callback function after hiding
     */
    static hideModal(modal, callback = null) {
        if (!modal) return;

        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            if (callback) callback();
        }, 200);
    }

    /**
     * Set loading state for an element
     * @param {HTMLElement} element - Element to show loading state
     * @param {boolean} isLoading - Whether to show loading state
     * @param {string} message - Loading message
     */
    static setLoadingState(element, isLoading, message = 'Loading...') {
        if (!element) return;

        if (isLoading) {
            element.innerHTML = `
                <div class="loading-state" style="
                    text-align: center;
                    padding: 2rem;
                    color: #666;
                ">
                    <div class="spinner" style="
                        border: 3px solid #f3f3f3;
                        border-top: 3px solid #3498db;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 1rem;
                    "></div>
                    <p>${message}</p>
                </div>
            `;
        } else {
            element.innerHTML = '';
        }
    }

    /**
     * Show empty state for an element
     * @param {HTMLElement} element - Element to show empty state
     * @param {string} message - Empty state message
     * @param {string} actionText - Action button text
     * @param {Function} actionCallback - Action button callback
     */
    static showEmptyState(element, message = 'No items found', actionText = null, actionCallback = null) {
        if (!element) return;

        let actionButton = '';
        if (actionText && actionCallback) {
            actionButton = `
                <button onclick="(${actionCallback.toString()})()" style="
                    background: #4caf50;
                    color: white;
                    border: none;
                    padding: 0.6rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.95rem;
                    margin-top: 1rem;
                ">
                    ${actionText}
                </button>
            `;
        }

        element.innerHTML = `
            <div class="empty-state" style="
                text-align: center;
                padding: 3rem 1rem;
                color: #666;
                background: #f9f9f9;
                border-radius: 8px;
                margin: 1rem 0;
            ">
                <i class="fas fa-inbox" style="
                    font-size: 3rem;
                    color: #ddd;
                    margin-bottom: 1rem;
                    display: block;
                "></i>
                <h3 style="
                    margin: 0 0 0.5rem;
                    color: #444;
                    font-weight: 500;
                ">${message}</h3>
                ${actionButton}
            </div>
        `;
    }

    /**
     * Debounce function to limit the rate of function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, wait = 300) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }
}

// ============================================================================
// FORM UTILITIES
// ============================================================================

class FormUtils {
    /**
     * Validate required fields in a form
     * @param {FormData} formData - Form data to validate
     * @param {Array<string>} requiredFields - Array of required field names
     * @returns {Object} Validation result with isValid and errors
     */
    static validateRequired(formData, requiredFields) {
        const errors = [];

        requiredFields.forEach(field => {
            const value = formData.get(field);
            if (!value || value.trim() === '') {
                errors.push(`${field} is required`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Get form data as an object
     * @param {HTMLFormElement} form - Form element
     * @returns {Object} Form data as object
     */
    static getFormData(form) {
        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        return data;
    }

    /**
     * Populate form with data
     * @param {HTMLFormElement} form - Form element
     * @param {Object} data - Data to populate
     */
    static populateForm(form, data) {
        Object.keys(data).forEach(key => {
            const element = form.elements[key];
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = data[key];
                } else {
                    element.value = data[key] || '';
                }
            }
        });
    }

    /**
     * Reset form and clear all fields
     * @param {HTMLFormElement} form - Form element
     */
    static resetForm(form) {
        form.reset();

        // Clear any hidden fields
        const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
        hiddenInputs.forEach(input => {
            if (input.id !== 'csrf_token') { // Preserve CSRF token if present
                input.remove();
            }
        });
    }
}

// ============================================================================
// CURRENCY UTILITIES
// ============================================================================

class CurrencyUtils {
    static formatter = new Intl.NumberFormat(
        CONFIG.CURRENCY_FORMAT.locale,
        CONFIG.CURRENCY_FORMAT
    );

    /**
     * Format a number as currency
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    static format(amount) {
        return this.formatter.format(amount || 0);
    }

    /**
     * Parse currency string to number
     * @param {string} currencyString - Currency string to parse
     * @returns {number} Parsed number
     */
    static parse(currencyString) {
        if (!currencyString) return 0;

        // Remove currency symbol and commas
        const cleanString = currencyString.replace(/[₦,]/g, '');
        return parseFloat(cleanString) || 0;
    }
}

// ============================================================================
// INITIALIZATION UTILITIES
// ============================================================================

class InitUtils {
    /**
     * Initialize a page with common functionality
     * @param {Object} options - Initialization options
     * @param {Function} options.onAuthSuccess - Callback when authentication succeeds
     * @param {Function} options.onAuthFail - Callback when authentication fails
     * @param {Array<string>} options.requiredElements - Required DOM element IDs
     * @returns {Object} Initialized utilities
     */
    static initializePage(options = {}) {
        const {
            onAuthSuccess = null,
            onAuthFail = null,
            requiredElements = []
        } = options;

        // Initialize authentication
        const auth = new AuthManager();

        // Check authentication
        if (!auth.checkAuth()) {
            if (onAuthFail) onAuthFail();
            return null;
        }

        // Initialize API service
        const api = new APIService(auth);

        // Cache required DOM elements
        const elements = DOMUtils.cacheElements(requiredElements);

        // Setup navigation
        const navLinks = document.querySelectorAll('.nav-links li');
        NavigationManager.setup(navLinks);

        // Setup logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => auth.logout());
        }

        if (onAuthSuccess) onAuthSuccess({ auth, api, elements });

        return { auth, api, elements };
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Make utilities available globally
window.AdminUtils = {
    CONFIG,
    AuthManager,
    APIService,
    NotificationManager,
    NavigationManager,
    DOMUtils,
    FormUtils,
    CurrencyUtils,
    InitUtils
};

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        AuthManager,
        APIService,
        NotificationManager,
        NavigationManager,
        DOMUtils,
        FormUtils,
        CurrencyUtils,
        InitUtils
    };
} 