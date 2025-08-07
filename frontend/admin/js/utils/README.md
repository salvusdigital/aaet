# Shared Utilities for Admin Dashboard

This directory contains shared utilities that eliminate code duplication across all admin pages.

## 📁 File Structure

```
admin/js/utils/
├── shared.js          # Main shared utilities file
└── README.md         # This documentation file
```

## 🚀 Quick Start

### 1. Include the Script

Add the shared utilities script to your HTML file **before** your page-specific script:

```html
<script src="js/utils/shared.js"></script>
<script src="js/your-page.js"></script>
```

### 2. Initialize Your Page

Use the `InitUtils.initializePage()` method to set up common functionality:

```javascript
class YourPageInitializer {
    static async initialize() {
        const utils = window.AdminUtils.InitUtils.initializePage({
            requiredElements: ['element1', 'element2'], // DOM element IDs you need
            onAuthSuccess: async ({ auth, api, elements }) => {
                // Your page-specific initialization code here
                console.log('Page initialized successfully!');
            },
            onAuthFail: () => {
                console.log('Authentication failed');
            }
        });
    }
}
```

## 📚 Available Utilities

### 🔐 Authentication (`AuthManager`)

Handles user authentication and session management.

```javascript
const auth = new window.AdminUtils.AuthManager();

// Check if user is authenticated
if (auth.checkAuth()) {
    // User is logged in
}

// Logout user
auth.logout();

// Get authentication token
const token = auth.getToken();
```

### 🌐 API Communication (`APIService`)

Makes authenticated API requests with automatic error handling.

```javascript
const api = new window.AdminUtils.APIService(auth);

// GET request
const data = await api.get('/admin/endpoint');

// POST request
const result = await api.post('/admin/endpoint', { key: 'value' });

// PUT request
const updated = await api.put('/admin/endpoint/123', { key: 'new-value' });

// DELETE request
await api.delete('/admin/endpoint/123');
```

### 🔔 Notifications (`NotificationManager`)

Shows user-friendly notifications.

```javascript
// Success notification
window.AdminUtils.NotificationManager.showSuccess('Operation completed successfully!');

// Error notification
window.AdminUtils.NotificationManager.showError('Something went wrong!');

// Warning notification
window.AdminUtils.NotificationManager.showWarning('Please check your input.');
```

### 🧭 Navigation (`NavigationManager`)

Handles page navigation.

```javascript
// Setup navigation (automatically done by InitUtils)
window.AdminUtils.NavigationManager.setup(navLinks);

// Navigate to a section
window.AdminUtils.NavigationManager.navigateToSection('categories');
```

### 🎨 DOM Utilities (`DOMUtils`)

Common DOM manipulation functions.

```javascript
// Cache DOM elements
const elements = window.AdminUtils.DOMUtils.cacheElements(['id1', 'id2']);

// Show/hide modal
window.AdminUtils.DOMUtils.showModal(modalElement);
window.AdminUtils.DOMUtils.hideModal(modalElement);

// Set loading state
window.AdminUtils.DOMUtils.setLoadingState(element, true, 'Loading...');

// Show empty state
window.AdminUtils.DOMUtils.showEmptyState(element, 'No items found');

// Debounce function
const debouncedSearch = window.AdminUtils.DOMUtils.debounce(searchFunction, 300);
```

### 📝 Form Utilities (`FormUtils`)

Form handling and validation.

```javascript
// Validate required fields
const validation = window.AdminUtils.FormUtils.validateRequired(formData, ['name', 'email']);
if (!validation.isValid) {
    console.log('Validation errors:', validation.errors);
}

// Get form data as object
const data = window.AdminUtils.FormUtils.getFormData(form);

// Populate form with data
window.AdminUtils.FormUtils.populateForm(form, { name: 'John', email: 'john@example.com' });

// Reset form
window.AdminUtils.FormUtils.resetForm(form);
```

### 💰 Currency Utilities (`CurrencyUtils`)

Format and parse currency values.

```javascript
// Format number as currency
const formatted = window.AdminUtils.CurrencyUtils.format(1500); // "₦1,500"

// Parse currency string to number
const amount = window.AdminUtils.CurrencyUtils.parse('₦1,500'); // 1500
```

## 🏗️ Configuration

All configuration is centralized in the `CONFIG` object:

```javascript
window.AdminUtils.CONFIG = {
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
```

## 📋 Best Practices

### 1. Always Use Shared Utilities

Instead of writing your own authentication, API calls, or notifications, use the shared utilities:

```javascript
// ❌ Don't do this
function showError(message) {
    alert(message);
}

// ✅ Do this instead
window.AdminUtils.NotificationManager.showError(message);
```

### 2. Use DOM Caching

Cache DOM elements for better performance:

```javascript
// ❌ Don't do this
document.getElementById('element').addEventListener('click', handler);

// ✅ Do this instead
const elements = window.AdminUtils.DOMUtils.cacheElements(['element']);
elements.element.addEventListener('click', handler);
```

### 3. Handle Errors Properly

Always wrap API calls in try-catch blocks:

```javascript
try {
    const data = await window.AdminUtils.api.get('/admin/endpoint');
    // Handle success
} catch (error) {
    window.AdminUtils.NotificationManager.showError(error.message);
}
```

### 4. Use Form Validation

Validate forms before submission:

```javascript
const validation = window.AdminUtils.FormUtils.validateRequired(formData, ['name', 'email']);
if (!validation.isValid) {
    window.AdminUtils.NotificationManager.showError(validation.errors[0]);
    return;
}
```

## 🔧 Adding New Utilities

To add new shared utilities:

1. Add your utility class to `shared.js`
2. Export it in the `window.AdminUtils` object
3. Update this README with documentation
4. Test across all admin pages

Example:

```javascript
// In shared.js
class NewUtility {
    static doSomething() {
        // Your utility code
    }
}

// Add to exports
window.AdminUtils = {
    // ... existing utilities
    NewUtility
};
```

## 🐛 Troubleshooting

### Common Issues

1. **Script not loaded**: Make sure `shared.js` is included before your page script
2. **Authentication errors**: Check that the token is valid and not expired
3. **API errors**: Verify the API endpoint and request format
4. **DOM errors**: Ensure element IDs match between HTML and JavaScript

### Debug Mode

Enable debug logging by checking the browser console for detailed error messages and request logs.

## 📖 Examples

See the refactored files for complete examples:
- `dashboard.js` - Menu item management
- `categories.js` - Category management  
- `settings.js` - Settings management

Each file demonstrates proper usage of the shared utilities while maintaining clean, readable code. 