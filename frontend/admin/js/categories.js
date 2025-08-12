/**
 * Categories Management - Simplified Version
 * 
 * This is a simplified version that works independently without complex shared utilities.
 * Focuses on basic CRUD operations for categories.
 */

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
        const response = await fetch(url, { ...defaultOptions, ...options });

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
            return data;
    } catch (error) {
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
        modal.style.display = 'block';
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
        // Add backdrop
        document.body.style.overflow = 'hidden';
    } else {
    }
}

/**
 * Hide modal
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        // Remove backdrop
        document.body.style.overflow = 'auto';
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
        isLoading = true;
        setLoadingState(true, 'Loading categories...');

        // First, fetch all categories
        const categoriesData = await apiRequest('/admin/categories');

        if (!Array.isArray(categoriesData)) {
            throw new Error('Invalid categories data format');
        }

        let categoriesWithCounts = [...categoriesData];
        
        try {
            // Try to fetch menu items to count items per category
            const menuItems = await apiRequest('/admin/menu');
            
            if (Array.isArray(menuItems)) {
                const itemCounts = {};
                menuItems.forEach(item => {
                    if (item.category_id) {
                        itemCounts[item.category_id] = (itemCounts[item.category_id] || 0) + 1;
                    }
                });

                // Add item count to each category
                categoriesWithCounts = categoriesData.map(category => ({
                    ...category,
                    itemCount: itemCounts[category.id] || 0
                }));
            }
        } catch (error) {
            categoriesWithCounts = categoriesData.map(category => ({
                ...category,
                itemCount: 0
            }));
        }

        // Sort categories by sort_order
        categories = [...categoriesWithCounts].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

        if (categories.length === 0) {
            showEmptyState('No Categories Found', 'Add Your First Category', showCategoryModal);
        } else {
            displayCategories(categories);
        }

    } catch (error) {
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
/**
 * Display categories in the grid with improved performance and error handling
 * @param {Array<Object>} categoriesToDisplay - Array of category objects to display
 * @returns {void}
 */
function displayCategories(categoriesToDisplay) {
    try {
        const grid = document.getElementById('categoriesGrid');
        if (!grid) {
            console.error('Categories grid element not found');
            return;
        }

        // Clear existing content
        grid.innerHTML = '';

        // Handle empty state
        if (!Array.isArray(categoriesToDisplay) || categoriesToDisplay.length === 0) {
            showEmptyState('No Categories Found', 'Add Your First Category', showCategoryModal);
            return;
        }
        
        // Use document fragment for better performance
        const fragment = document.createDocumentFragment();
        let validCategories = 0;

        categoriesToDisplay.forEach(category => {
            try {
                if (!category || typeof category !== 'object' || !category.id) {
                    return;
                }

                const card = createCategoryCard(category);
                if (card) {
                    fragment.appendChild(card);
                    validCategories++;
                }
            } catch (error) {
                console.error('Error creating category card:', error, category);
            }
        });

        // Append all cards at once
        grid.appendChild(fragment);

        // Log results
        if (validCategories > 0) {
        } else {
            showEmptyState('No Valid Categories Found', 'Add New Category', showCategoryModal);
        }
    } catch (error) {
        showNotification('Failed to display categories. Please try again.', 'error');
    }
}

/**
 * Create a category card element
 */
function createCategoryCard(category) {
    const card = document.createElement('div');
    card.className = 'category-card';
    
    // Card header
    const header = document.createElement('div');
    header.className = 'category-card-header';

    const name = document.createElement('h3');
    name.className = 'category-card-name';
    name.textContent = category.name || 'Unnamed Category';

    const status = document.createElement('span');
    status.className = `category-status ${category.status || 'active'}`;
    status.textContent = category.status || 'active';

    header.appendChild(name);
    header.appendChild(status);

    // Card body
    const body = document.createElement('div');
    body.className = 'category-card-body';

    // Add group badge
    const groupBadge = document.createElement('span');
    groupBadge.className = 'category-group-badge';
    groupBadge.textContent = category.group || 'UNKNOWN';
    groupBadge.setAttribute('data-group', category.group || 'UNKNOWN');

    const description = document.createElement('p');
    description.className = 'category-card-description';
    description.textContent = category.description || 'No description available';

    body.appendChild(groupBadge);
    body.appendChild(document.createElement('br'));
    body.appendChild(description);

    // Card footer
    const footer = document.createElement('div');
    footer.className = 'category-card-footer';

    // Stats
    const stats = document.createElement('div');
    stats.className = 'category-card-stats';

    const itemCount = document.createElement('span');
    const itemCountValue = category.itemCount || 0;
    itemCount.innerHTML = `<i class="fas fa-utensils" style="margin-right: 0.25rem;"></i>${itemCountValue} ${itemCountValue === 1 ? 'item' : 'items'}`;

    const date = document.createElement('span');
    date.innerHTML = `<i class="far fa-calendar" style="margin-right: 0.25rem;"></i>${category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}`;

    stats.appendChild(itemCount);
    stats.appendChild(date);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'category-card-actions';

    const editBtn = createActionButton('edit', 'edit', () => editCategory(category.id));
    const deleteBtn = createActionButton('trash', 'delete', () => deleteCategory(category.id));

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
function createActionButton(icon, type, onClick) {
    const button = document.createElement('button');
    button.className = `btn-action btn-${type}`;
    button.innerHTML = `<i class="fas fa-${icon}"></i>`;
    button.title = icon.charAt(0).toUpperCase() + icon.slice(1);
    
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

        // Get all form data for debugging
        const formDataObj = {};
        formData.forEach((value, key) => {
            formDataObj[key] = value;
        });
        console.log('Form data:', formDataObj);
        
        // Get group value
        let groupValue = formData.get('group') || 'FOOD';
        console.log('Raw group value:', groupValue);
        
        // Ensure group is valid
        const validGroups = ['FOOD', 'DRINKS'];
        groupValue = groupValue.toUpperCase();
        if (!validGroups.includes(groupValue)) {
            console.warn(`Invalid group '${groupValue}', defaulting to 'FOOD'`);
            groupValue = 'FOOD';
        }
        
        // Prepare request body with proper field names
        const requestBody = {
            name: formData.get('name').trim(),
            description: formData.get('description').trim(),
            sort_order: parseInt(formData.get('sort_order') || 0, 10),
            status: formData.get('status') || 'active',
            group: groupValue
        };
        
        console.log('Request body:', requestBody);

        // Set up common request options
        const requestOptions = {
            method: id ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(requestBody)
        };

        console.log('Sending request with options:', {
            ...requestOptions,
            body: JSON.parse(requestOptions.body) // Log parsed body for better readability
        });

        // Make the API request
        const endpoint = id ? `/admin/categories/${id}` : '/admin/categories';
        const response = await apiRequest(endpoint, requestOptions);
        
        console.log('API response:', response);

        // Only proceed if the API call was successful
        if (response) {
            hideCategoryModal();

            // Update the local categories array immediately
            if (id) {
                // Update existing category in local array
                const index = categories.findIndex(cat => cat.id === id);
                if (index !== -1) {
                    categories[index] = { ...categories[index], ...requestBody };
                }
            } else {
                // Add new category to local array
                const newCategory = { ...requestBody, id: response.id || Date.now() };
                categories.push(newCategory);
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

        // If we got an error, show the error message
        showNotification(error.message || 'Failed to save category. Please try again.', 'error');
        
        // If it's an update and we got an error, try to refresh the data
        if (formData.get('id')) {
            try {
                await loadCategories();
            } catch (refreshError) {
                // Silently fail refresh
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
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) {
        modalTitle.textContent = category ? 'Edit Category' : 'Add Category';
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
        // Debug: Log the category data
        console.log('Category data:', {
            name: category.name,
            group: category.group,
            'group type': typeof category.group
        });
        
        // Debug: Log the group input element
        console.log('Group input element:', groupInput);
        
        // Populate form with existing category data
        nameInput.value = category.name || '';
        descriptionInput.value = category.description || '';
        sortOrderInput.value = category.sort_order || 0;
        statusInput.value = category.status || 'active';
        
        // Set group value - ensure it matches the case of the option values
        const groupValue = (category.group || 'FOOD').toUpperCase();
        console.log('Setting group value to:', groupValue);
        groupInput.value = groupValue;
        
        // Debug: Log after setting value
        console.log('Group input value after setting:', groupInput.value);

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

            // Navigate to the appropriate page
            navigateToSection(section);
        });
    });
}

/**
 * Navigate to a specific section/page
 * @param {string} section - The section to navigate to
 */
function navigateToSection(section) {
    const targetPage = NAVIGATION_CONFIG[section];

    if (targetPage) {
        window.location.href = targetPage;
    } else {
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
        addBtn.addEventListener('click', () => {
            showCategoryModal();
        });
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
        // Check authentication
        const token = localStorage.getItem('adminToken');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // Initialize event listeners
        initializeEventListeners();

        // Set active navigation
        setActiveNavigation();

        // Load categories
        await loadCategories();

    } catch (error) {
        showNotification('Failed to initialize categories page. Please refresh the page.', 'error');
    }
}

// ============================================================================
// STARTUP
// ============================================================================

// Initialize the categories page when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
});

// If the document is already loaded, initialize immediately
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initializePage();
}

// Global function for testing modal (can be called from browser console)
window.testModal = function () {
    showCategoryModal();
};

// Global function for testing API (can be called from browser console)
window.testAPI = async function () {
    try {
        const response = await apiRequest('/admin/categories');
        return response;
    } catch (error) {
        return error;
    }
};

// Global function to get category details (for debugging)
window.getCategoryDetails = async function (id) {
    try {
        const response = await apiRequest(`/admin/categories/${id}`);
        return response;
    } catch (error) {
        return error;
    }
};

// Global function to refresh categories (for debugging)
window.refreshCategories = async function () {
    try {
        await loadCategories();
        return categories;
    } catch (error) {
        return error;
    }
};

// Global function to show current categories state
window.showCategoriesState = function () {
    return categories;
};