/**
 * Categories Management - Simplified Version
 * 
 * This is a simplified version that works independently without complex shared utilities.
 * Focuses on basic CRUD operations for categories.
 */

// Prevent old code from running
if (typeof window.AdminUtils !== 'undefined') {
    console.warn('Old AdminUtils detected, this should not happen with simplified version');
}

// Version check
const CATEGORIES_VERSION = '2.0-simplified';
console.log(`Categories.js version: ${CATEGORIES_VERSION}`);

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
    }
};

// ============================================================================
// GLOBAL STATE
// ============================================================================

let categories = [];
let isLoading = false;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Simple API request function
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${CONFIG.API_URL}${endpoint}`;
    const token = localStorage.getItem('adminToken');

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    try {
        console.log('Making API request to:', url, 'with options:', { ...defaultOptions, ...options });

        const response = await fetch(url, { ...defaultOptions, ...options });

        console.log('Response status:', response.status, 'Response headers:', response.headers);

        if (!response.ok) {
            // Try to get error details from response
            let errorDetails = '';
            try {
                const errorData = await response.json();
                errorDetails = errorData.message || errorData.error || JSON.stringify(errorData);
            } catch (e) {
                errorDetails = response.statusText;
            }

            const error = new Error(`HTTP error! status: ${response.status}, details: ${errorDetails}`);
            error.status = response.status;
            error.details = errorDetails;
            throw error;
        }

        const data = await response.json();
        console.log('API response data:', data);
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    // Set background color based on type
    const colors = {
        success: '#4caf50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    notification.textContent = message;
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * Show loading state
 */
function setLoadingState(isLoading, message = 'Loading...') {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;

    if (isLoading) {
        grid.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <div style="margin-bottom: 10px;">${message}</div>
                <div style="width: 20px; height: 20px; border: 2px solid #ddd; border-top: 2px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            </div>
        `;
    }
}

/**
 * Show empty state
 */
function showEmptyState(message = 'No categories found', actionText = null, actionCallback = null) {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;

    let html = `
        <div style="text-align: center; padding: 40px; color: #666;">
            <div style="font-size: 48px; margin-bottom: 20px;">📁</div>
            <h3 style="margin-bottom: 10px; color: #333;">${message}</h3>
    `;

    if (actionText && actionCallback) {
        html += `<button onclick="showCategoryModal()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">${actionText}</button>`;
    }

    html += '</div>';
    grid.innerHTML = html;
}

/**
 * Show modal
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        console.log('Showing modal:', modalId);
        modal.style.display = 'block';
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
        // Add backdrop
        document.body.style.overflow = 'hidden';
    } else {
        console.error('Modal not found:', modalId);
    }
}

/**
 * Hide modal
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        console.log('Hiding modal:', modalId);
        modal.style.display = 'none';
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        // Remove backdrop
        document.body.style.overflow = 'auto';
    } else {
        console.error('Modal not found:', modalId);
    }
}

/**
 * Reset form
 */
function resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
    }
}

// ============================================================================
// CATEGORY MANAGEMENT
// ============================================================================

/**
 * Load categories from API
 */
async function loadCategories() {
    try {
        console.log('Loading categories...');
        isLoading = true;
        setLoadingState(true, 'Loading categories...');

        const data = await apiRequest('/admin/categories');

        if (!Array.isArray(data)) {
            throw new Error('Invalid categories data format');
        }

        // Sort categories by sort_order
        categories = [...data].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

        if (categories.length === 0) {
            showEmptyState('No Categories Found', 'Add Your First Category', showCategoryModal);
        } else {
            displayCategories(categories);
        }

        console.log(`Successfully loaded ${categories.length} categories`);

    } catch (error) {
        console.error('Error loading categories:', error);
        showNotification('Failed to load categories. ' + (error.message || 'Please try again.'), 'error');
        showEmptyState('Failed to load categories');
    } finally {
        isLoading = false;
        setLoadingState(false);
    }
}

/**
 * Display categories in the grid
 */
function displayCategories(categoriesToDisplay) {
    console.log('Displaying categories:', categoriesToDisplay);

    const grid = document.getElementById('categoriesGrid');
    if (!grid) {
        console.error('Categories grid element not found');
        return;
    }

    if (!categoriesToDisplay || categoriesToDisplay.length === 0) {
        showEmptyState('No Categories Found', 'Add Your First Category', showCategoryModal);
        return;
    }

    // Create grid container
    const gridContainer = document.createElement('div');
    gridContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
            padding: 1rem;
        `;

    // Add each category card
    categoriesToDisplay.forEach(category => {
        if (!category || !category.id) {
            console.warn('Invalid category data:', category);
            return;
        }

        const card = createCategoryCard(category);
        gridContainer.appendChild(card);
    });

    // Clear existing content and add the new grid
    grid.innerHTML = '';
    grid.appendChild(gridContainer);
    console.log(`Displayed ${categoriesToDisplay.length} categories in the grid`);
}

/**
 * Create a category card element
 */
function createCategoryCard(category) {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.style.cssText = `
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            cursor: pointer;
        `;

    // Add hover effect
    card.onmouseenter = () => {
        card.style.transform = 'translateY(-4px)';
        card.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
    };
    card.onmouseleave = () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    };

    // Card header
    const header = document.createElement('div');
    header.style.cssText = `
            padding: 1.25rem;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

    const name = document.createElement('h3');
    name.textContent = category.name || 'Unnamed Category';
    name.style.cssText = `
            margin: 0;
            font-size: 1.1rem;
            color: #333;
        `;

    const status = document.createElement('span');
    status.textContent = category.status || 'active';
    status.style.cssText = `
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background-color: ${category.status === 'inactive' ? '#f44336' : '#4caf50'};
            color: white;
        `;

    header.appendChild(name);
    header.appendChild(status);

    // Card body
    const body = document.createElement('div');
    body.style.cssText = `
            padding: 1.25rem;
            padding-bottom: 0.5rem;
        `;

    const description = document.createElement('p');
    description.textContent = category.description || 'No description available';
    description.style.cssText = `
            margin: 0 0 1rem;
            color: #666;
            font-size: 0.9rem;
            line-height: 1.5;
        `;

    body.appendChild(description);

    // Card footer
    const footer = document.createElement('div');
    footer.style.cssText = `
            padding: 0.75rem 1.25rem;
            background: #f9f9f9;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

    // Stats
    const stats = document.createElement('div');
    stats.style.cssText = `
            display: flex;
            gap: 1rem;
            font-size: 0.8rem;
            color: #777;
        `;

    const itemCount = document.createElement('span');
    itemCount.innerHTML = `<i class="fas fa-utensils" style="margin-right: 0.25rem;"></i>${category.itemCount || 0} items`;

    const date = document.createElement('span');
    date.innerHTML = `<i class="far fa-calendar" style="margin-right: 0.25rem;"></i>${category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}`;

    stats.appendChild(itemCount);
    stats.appendChild(date);

    // Actions
    const actions = document.createElement('div');
    actions.style.cssText = `
            display: flex;
            gap: 0.5rem;
        `;

    const editBtn = createActionButton('edit', '#2196f3', () => editCategory(category.id));
    const deleteBtn = createActionButton('trash', '#f44336', () => deleteCategory(category.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    footer.appendChild(stats);
    footer.appendChild(actions);

    // Assemble the card
    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);

    return card;
}

/**
 * Create an action button
 */
function createActionButton(icon, color, onClick) {
    const button = document.createElement('button');
    button.innerHTML = `<i class="fas fa-${icon}"></i>`;
    button.title = icon.charAt(0).toUpperCase() + icon.slice(1);
    button.style.cssText = `
            background: none;
            border: none;
            color: ${color};
            cursor: pointer;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            transition: background-color 0.2s;
        `;

    button.onmouseover = () => button.style.backgroundColor = `${color}20`;
    button.onmouseout = () => button.style.backgroundColor = 'transparent';
    button.onclick = (e) => {
        e.stopPropagation();
        onClick();
    };

    return button;
}

/**
 * Save a category (create or update)
*/
async function saveCategory(formData) {
    try {
        // Basic validation
        const name = formData.get('name');
        if (!name || name.trim() === '') {
            showNotification('Category name is required', 'error');
            return;
        }

        isLoading = true;
        const id = formData.get('id');

        // Log all form data for debugging
        console.log('Form data entries:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        // Prepare request body with proper field names
        const requestBody = {
            name: formData.get('name').trim(),
            description: formData.get('description') || '',
            status: formData.get('status') || 'active',
            sort_order: parseInt(formData.get('sort_order') || '0', 10),
            group: formData.get('group') || 'food'
        };

        console.log('Saving category with data:', { id, requestBody });

        let response;
        if (id) {
            // Update existing category
            console.log(`Updating category with ID: ${id}`);
            response = await apiRequest(`/admin/categories/${id}`, {
                method: 'PUT',
                body: JSON.stringify(requestBody)
            });
            console.log('Update response:', response);
        } else {
            // Create new category
            console.log('Creating new category');
            response = await apiRequest('/admin/categories', {
                method: 'POST',
                body: JSON.stringify(requestBody)
            });
            console.log('Create response:', response);
        }

        // Only proceed if the API call was successful
        if (response) {
            hideCategoryModal();

            // Update the local categories array immediately
            if (id) {
                // Update existing category in local array
                const index = categories.findIndex(cat => cat.id === id);
                if (index !== -1) {
                    categories[index] = { ...categories[index], ...requestBody };
                    console.log('Updated category in local array:', categories[index]);
                }
            } else {
                // Add new category to local array
                const newCategory = { ...requestBody, id: response.id || Date.now() };
                categories.push(newCategory);
                console.log('Added new category to local array:', newCategory);
            }

            // Re-display categories with updated data
            displayCategories(categories);

            showNotification(`Category ${id ? 'updated' : 'created'} successfully!`, 'success');
        }

    } catch (error) {
        console.error('Error saving category:', error);

        // Try to get more detailed error information
        let errorMessage = 'Failed to save category. Please try again.';

        if (error.message.includes('400')) {
            errorMessage = 'Invalid data provided. Please check all required fields.';
        } else if (error.message.includes('401')) {
            errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.message.includes('403')) {
            errorMessage = 'You do not have permission to perform this action.';
        } else if (error.message.includes('404')) {
            errorMessage = 'Category not found.';
        } else if (error.message.includes('409')) {
            errorMessage = 'A category with this name already exists.';
        }

        showNotification(errorMessage, 'error');

        // If it's an update and we got an error, try to refresh the data
        if (id) {
            console.log('Update failed, refreshing categories from server...');
            try {
                await loadCategories();
            } catch (refreshError) {
                console.error('Failed to refresh categories:', refreshError);
            }
        }
    } finally {
        isLoading = false;
    }
}

/**
 * Delete a category
 */
async function deleteCategory(id) {
    if (!confirm('Are you sure you want to delete this category? This will affect all menu items in this category.')) {
        return;
    }

    try {
        isLoading = true;
        await apiRequest(`/admin/categories/${id}`, {
            method: 'DELETE'
        });

        // Remove the category from the UI immediately
        categories = categories.filter(cat => cat.id !== id);
        displayCategories(categories);
        showNotification('Category deleted successfully!', 'success');

    } catch (error) {
        console.error('Error deleting category:', error);
        showNotification(error.message || 'Failed to delete category. Please try again.', 'error');
    } finally {
        isLoading = false;
    }
}

/**
 * Edit a category
 */
function editCategory(id) {
    const category = categories.find(cat => cat.id === id);
    if (!category) {
        console.error('Category not found:', id);
        showNotification('Category not found', 'error');
        return;
    }
    showCategoryModal(category);
}

// ============================================================================
// MODAL MANAGEMENT
// ============================================================================

/**
* Show category modal
 */
function showCategoryModal(category = null) {
    console.log('Opening modal with category data:', category);

    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) {
        modalTitle.textContent = category ? 'Edit Category' : 'Add Category';
    } else {
        console.error('Modal title element not found');
    }

    populateForm(category);
    showModal('categoryModal');

    // Add show class for animation
    setTimeout(() => {
        const modal = document.getElementById('categoryModal');
        if (modal) {
            modal.classList.add('show');
        }
    }, 10);
}

/**
 * Hide category modal
 */
function hideCategoryModal() {
    const modal = document.getElementById('categoryModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            hideModal('categoryModal');
            resetForm('categoryForm');
        }, 300);
    } else {
        hideModal('categoryModal');
        resetForm('categoryForm');
    }
}

/**
 * Populate the form with category data
*/
function populateForm(category) {
    const nameInput = document.getElementById('categoryName');
    const descriptionInput = document.getElementById('categoryDescription');
    const sortOrderInput = document.getElementById('categorySortOrder');
    const statusInput = document.getElementById('categoryStatus');
    const groupInput = document.getElementById('categoryGroup');

    if (category) {
        // Populate form with existing category data
        nameInput.value = category.name || '';
        descriptionInput.value = category.description || '';
        sortOrderInput.value = category.sort_order || 0;
        statusInput.value = category.status || 'active';
        groupInput.value = category.group || 'food';

        // Add hidden input for category ID
        addHiddenIdInput(category.id);
    } else {
        // Reset form for new category
        resetForm('categoryForm');
        removeHiddenIdInput();
        // Set default values
        if (sortOrderInput) sortOrderInput.value = 0;
        if (statusInput) statusInput.value = 'active';
        if (groupInput) groupInput.value = 'food';
    }
}

/**
 * Add hidden input for category ID
 */
function addHiddenIdInput(id) {
    let idInput = document.getElementById('categoryId');
    if (!idInput) {
        idInput = document.createElement('input');
        idInput.type = 'hidden';
        idInput.id = 'categoryId';
        idInput.name = 'id';
        document.getElementById('categoryForm').appendChild(idInput);
    }
    idInput.value = id;
}

/**
 * Remove hidden ID input
 */
function removeHiddenIdInput() {
    const idInput = document.getElementById('categoryId');
    if (idInput) {
        idInput.remove();
    }
}

// ============================================================================
// SEARCH & FILTER FUNCTIONALITY
// ============================================================================

/**
 * Filter categories based on search and status
 */
function filterCategories() {
    if (isLoading || !categories) return;

    const searchTerm = document.getElementById('searchCategories')?.value?.toLowerCase() || '';
    const status = document.getElementById('statusFilter')?.value || '';

    const filtered = categories.filter(category => {
        const matchesSearch = !searchTerm ||
            category.name.toLowerCase().includes(searchTerm) ||
            (category.description && category.description.toLowerCase().includes(searchTerm));
        const matchesStatus = !status || category.status === status;
        return matchesSearch && matchesStatus;
    });

    displayCategories(filtered);
}

// ============================================================================
// NAVIGATION MANAGEMENT
// ============================================================================

/**
 * Navigation configuration
 */
const NAVIGATION_CONFIG = {
    'menu-items': 'dashboard.html',
    'categories': 'categories.html',
    'settings': 'settings.html'
};

/**
 * Setup navigation functionality
 */
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links li[data-section]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));

            // Add active class to clicked link
            link.classList.add('active');

            // Get the section to navigate to
            const section = link.getAttribute('data-section');
            console.log('Navigating to section:', section);

            // Navigate to the appropriate page
            navigateToSection(section);
        });
    });

    console.log(`Navigation setup complete. Found ${navLinks.length} navigation links.`);
}

/**
 * Navigate to a specific section/page
 * @param {string} section - The section to navigate to
 */
function navigateToSection(section) {
    const targetPage = NAVIGATION_CONFIG[section];

    if (targetPage) {
        console.log(`Navigating to: ${targetPage}`);
        window.location.href = targetPage;
    } else {
        console.error(`Unknown section: ${section}`);
        showNotification(`Navigation to ${section} not implemented yet`, 'warning');
    }
}

/**
 * Set active navigation link based on current page
 */
function setActiveNavigation() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-links li[data-section]');

    navLinks.forEach(link => {
        const section = link.getAttribute('data-section');
        const targetPage = NAVIGATION_CONFIG[section];

        if (targetPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Setup navigation
    setupNavigation();

    // Add new category button
    const addBtn = document.getElementById('addCategoryBtn');
    if (addBtn) {
        console.log('Add category button found, adding event listener');
        addBtn.addEventListener('click', () => {
            console.log('Add category button clicked');
            showCategoryModal();
        });
    } else {
        console.error('Add category button not found');
    }

    // Close modal button
    document.querySelector('.close')?.addEventListener('click', hideCategoryModal);

    // Save category form handler
    document.getElementById('categoryForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        await saveCategory(formData);
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('categoryModal')) {
            hideCategoryModal();
        }
    });

    // Search and filter
    const searchInput = document.getElementById('searchCategories');
    const statusFilter = document.getElementById('statusFilter');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            filterCategories();
        }, 300));
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            filterCategories();
        });
    }

    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('adminToken');
        window.location.href = 'login.html';
    });
}

/**
 * Debounce function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================================================
// PAGE INITIALIZATION
// ============================================================================

/**
 * Initialize the categories page
 */
async function initializePage() {
    try {
        console.log('🚀 Starting categories page initialization...');

        // Check authentication
        const token = localStorage.getItem('adminToken');
        if (!token) {
            console.log('🔐 No authentication token found, redirecting to login...');
            window.location.href = 'login.html';
            return;
        }

        // Initialize event listeners
        initializeEventListeners();

        // Set active navigation
        setActiveNavigation();

        // Load categories
        console.log('🚀 Loading categories...');
        await loadCategories();

        console.log('🚀 Categories page initialization complete!');

    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('Failed to initialize categories page. Please refresh the page.', 'error');
    }
}

// ============================================================================
// STARTUP
// ============================================================================

// Initialize the categories page when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 DOM loaded, initializing categories page...');
    console.log('Current script file:', document.currentScript?.src || 'inline');
    initializePage();
});

// If the document is already loaded, initialize immediately
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('🔐 Document already loaded, initializing...');
    console.log('Current script file:', document.currentScript?.src || 'inline');
    initializePage();
}

// Global function for testing modal (can be called from browser console)
window.testModal = function () {
    console.log('Testing modal...');
    showCategoryModal();
};

// Global function for testing API (can be called from browser console)
window.testAPI = async function () {
    try {
        console.log('Testing API connection...');
        const response = await apiRequest('/admin/categories');
        console.log('API test successful:', response);
        return response;
    } catch (error) {
        console.error('API test failed:', error);
        return error;
    }
};

// Global function to get category details (for debugging)
window.getCategoryDetails = async function (id) {
    try {
        console.log('Getting category details for ID:', id);
        const response = await apiRequest(`/admin/categories/${id}`);
        console.log('Category details:', response);
        return response;
    } catch (error) {
        console.error('Failed to get category details:', error);
        return error;
    }
};

// Global function to refresh categories (for debugging)
window.refreshCategories = async function () {
    try {
        console.log('Manually refreshing categories...');
        await loadCategories();
        console.log('Categories refreshed successfully');
        return categories;
    } catch (error) {
        console.error('Failed to refresh categories:', error);
        return error;
    }
};

// Global function to show current categories state
window.showCategoriesState = function () {
    console.log('Current categories state:', categories);
    console.log('Categories count:', categories.length);
    return categories;
};