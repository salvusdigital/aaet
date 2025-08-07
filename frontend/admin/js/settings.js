/**
 * Settings Management
 * 
 * This file handles all settings-related functionality for the admin dashboard.
 * Uses shared utilities from utils/shared.js to avoid code duplication.
 * 
 * @author Your Name
 * @version 2.0
 */

// ============================================================================
// DOM ELEMENTS CACHE
// ============================================================================

class DOMCache {
    constructor() {
        this.elements = {};
        this.initializeElements();
    }

    /**
     * Initialize all DOM element references
     */
    initializeElements() {
        const elementIds = [
            'logoutBtn', 'adminAccountForm', 'username', 'email'
        ];

        elementIds.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });

        // Cache other commonly used elements
        this.elements.navLinks = document.querySelectorAll('.nav-links li');
    }

    /**
     * Get a cached DOM element
     * @param {string} id - Element ID
     * @returns {HTMLElement|null} The DOM element
     */
    get(id) {
        return this.elements[id];
    }
}

const dom = new DOMCache();

// ============================================================================
// ADMIN ACCOUNT MANAGEMENT
// ============================================================================

class AdminAccountManager {
    /**
     * Load admin information from API
     */
    static async loadAdminInfo() {
        try {
            const admin = await window.AdminUtils.api.get('/admin/user');

            // Populate form fields
            if (dom.get('username')) {
                dom.get('username').value = admin.username || '';
            }
            if (dom.get('email')) {
                dom.get('email').value = admin.email || '';
            }

            // Admin info loaded successfully

        } catch (error) {
            console.error('[AdminAccountManager] Failed to load admin info:', error);
            window.AdminUtils.NotificationManager.showError('Failed to load admin information. Please try again.');
        }
    }

    /**
     * Change admin password
     * @param {FormData} formData - Form data containing password information
     */
    static async changePassword(formData) {
        try {
            const data = window.AdminUtils.FormUtils.getFormData(dom.get('adminAccountForm'));

            // Validate required fields
            const validation = window.AdminUtils.FormUtils.validateRequired(formData, [
                'password', 'password_confirmation'
            ]);

            if (!validation.isValid) {
                window.AdminUtils.NotificationManager.showError(validation.errors[0]);
                return;
            }

            // Validate password confirmation
            if (data.password !== data.password_confirmation) {
                window.AdminUtils.NotificationManager.showError('New passwords do not match');
                return;
            }

            // Make API request
            await window.AdminUtils.api.post('/admin/reset-password', {
                username: data.username,
                password: data.password,
                password_confirmation: data.password_confirmation
            });

            window.AdminUtils.NotificationManager.showSuccess('Password changed successfully!');

            // Reset form
            if (dom.get('adminAccountForm')) {
                window.AdminUtils.FormUtils.resetForm(dom.get('adminAccountForm'));
            }

        } catch (error) {
            console.error('[AdminAccountManager] Password change error:', error);
            window.AdminUtils.NotificationManager.showError(error.message || 'Failed to change password. Please try again.');
        }
    }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

class EventManager {
    /**
     * Initialize all event listeners
     */
    static initialize() {
        // Admin account form submission
        if (dom.get('adminAccountForm')) {
            dom.get('adminAccountForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                AdminAccountManager.changePassword(formData);
            });
        }
    }
}

// ============================================================================
// PAGE INITIALIZATION
// ============================================================================

class SettingsInitializer {
    /**
     * Initialize the settings page
     */
    static async initialize() {
        try {
            // Start page initialization

            // Initialize page with shared utilities
            const utils = window.AdminUtils.InitUtils.initializePage({
                requiredElements: [
                    'logoutBtn', 'adminAccountForm', 'username', 'email'
                ],
                onAuthSuccess: async ({ auth, api, elements }) => {
                    // Store API reference globally for this page
                    window.AdminUtils.api = api;

                    // Load admin information
                    // Load admin information
                    await AdminAccountManager.loadAdminInfo();

                    // Setup event listeners
                    EventManager.initialize();

                    // Page initialization complete
                },
                onAuthFail: () => {
                    // Authentication failed
                }
            });

            if (!utils) {
                // Authentication failed, redirecting...
            }

        } catch (error) {
            console.error('[SettingsInitializer] Initialization error:', error);
            window.AdminUtils.NotificationManager.showError('Failed to initialize settings page. Please refresh the page.');
        }
    }
}

// ============================================================================
// STARTUP
// ============================================================================

// Initialize the settings page when the page loads
document.addEventListener('DOMContentLoaded', () => {
    SettingsInitializer.initialize();
});

// If the document is already loaded, initialize immediately
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('🔐 [Main] Document already loaded, initializing...');
    SettingsInitializer.initialize();
} 