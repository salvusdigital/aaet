// API Configuration
const API_URL = 'https://menu.aaentertainment.ng/api';
let token = localStorage.getItem('adminToken');

// Global variables
let allMenuItems = [];
let categoriesList = [];

// DOM Elements
const itemsGrid = document.getElementById('menuItemsGrid');
const addItemBtn = document.getElementById('addItemBtn');
const itemModal = document.getElementById('itemModal');
const itemForm = document.getElementById('itemForm');
const closeModal = document.querySelector('.close');
const logoutBtn = document.getElementById('logoutBtn');
const searchInput = document.getElementById('searchItems');
const categoryFilter = document.getElementById('categoryFilter');
const navLinks = document.querySelectorAll('.nav-links li');

// Add currency formatter
const currencyFormatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
});

// Check Authentication
function checkAuth() {
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Navigation
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const section = e.currentTarget.dataset.section;
            if (section) {
                navigateToSection(section);
            }
        });
    });
}

// Navigation helpers
const NAVIGATION_PATHS = {
    'categories': 'categories.html',
    'settings': 'settings.html',
    'menu-items': null // current page
};

/**
 * Navigates to a section if it's a valid path
 * @param {string} section - The section to navigate to
 */
function navigateToSection(section) {
    const path = NAVIGATION_PATHS[section];
    if (path) {
        window.location.href = path;
    }
}

// Category extraction helpers

/**
 * Creates a category object from a menu item
 * @param {Object} item - Menu item with category information
 * @returns {Object} Normalized category object
 */
function createCategoryFromItem(item) {
    const categoryId = item.category_id;
    const categoryName = item.category_id?.name || `Category ${categoryId}`;

    return {
        _id: categoryId,
        name: categoryName,
        description: item.category_id?.description || `Category for ${categoryName}`,
        status: item.category_id?.status || 'active',
        createdAt: item.category_id?.createdAt || new Date().toISOString(),
        updatedAt: item.category_id?.updatedAt || new Date().toISOString(),
        isFallback: true
    };
}

/**
 * Extracts unique categories from menu items
 * @param {Array} menuItems - Array of menu items
 * @returns {Array} Array of unique categories
 */
async function extractCategoriesFromMenuItems(menuItems) {
    if (!Array.isArray(menuItems) || menuItems.length === 0) {
        return [];
    }

    try {
        const categories = new Map();

        for (const item of menuItems) {
            if (!item?.category_id) continue;

            const category = createCategoryFromItem(item);
            if (!categories.has(category.id)) {
                categories.set(category.id, category);
            }
        }

        const extractedCategories = Array.from(categories.values());

        if (extractedCategories.length > 0 && categoriesList.length === 0) {
            updateCategories(extractedCategories);
        }

        return extractedCategories;
    } catch (error) {
        showError('Failed to extract categories from menu items');
        return [];
    }
}

async function loadAllMenuItems() {
    try {
        const requestId = Date.now() + Math.random().toString(36).substr(2, 9);
        const response = await fetch(`${API_URL}/admin/menu`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Request-ID': requestId
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                logout();
                return;
            }
            throw new Error('Failed to load menu items');
        }

        allMenuItems = await response.json();
        displayMenuItems(allMenuItems);
    } catch (error) {
        showError('Failed to load menu items');
    }
}

function filterMenuItemsByCategory(categoryId = '') {
    if (!allMenuItems.length) return;

    if (!categoryId || categoryId === '' || categoryId === 'all') {
        // Show all items
        displayMenuItems(allMenuItems);
    } else {
        const filteredItems = allMenuItems.filter(item =>
            String(item.category_id) === String(categoryId)
        );
        displayMenuItems(filteredItems);
    }
}

/**
 * Loads categories from the API and updates the UI
 * Falls back to extracting from menu items if the categories API fails
 * @returns {Promise<void>}
 */
async function loadCategories() {
    try {
        const requestId = Date.now() + Math.random().toString(36).substr(2, 9);
        const url = `${API_URL}/admin/categories`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
                'X-Request-ID': requestId
            },
            // Ensure we don't cache the categories response
            cache: 'no-store'
        });

        const responseStatus = response.status;

        if (response.ok) {
            const categories = await response.json();

            if (!Array.isArray(categories)) {
                throw new Error('Invalid categories data format received');
            }

            // Update global categories list and map
            categoriesList = categories;

            categoryMap.clear();
            categories.forEach(cat => {
                if (cat && cat.id !== undefined && cat.name) {
                    categoryMap.set(String(cat.id), cat.name);
                }
            });

            populateCategoryFilter(categories);
            populateMenuFormCategoryDropdown(categories);

            if (allMenuItems.length > 0) {
                displayMenuItems(allMenuItems);
            }

            return;
        }

        // Handle specific error cases
        if (responseStatus === 401) {
            logout();
            return;
        }

        // For server errors, try to extract categories from menu items
        if (responseStatus >= 500) {
            await extractCategoriesFromMenuItems(allMenuItems);
            return;
        }

        // Try to extract from menu items as fallback
        if (allMenuItems?.length > 0) {
            await extractCategoriesFromMenuItems(allMenuItems);
        } else {
            showError('Failed to load categories. Please refresh the page.');
        }
    } catch (error) {
        showError('Failed to load categories. Please check your connection and refresh the page.');

        // As a last resort, try to extract from menu items if available
        if (allMenuItems?.length > 0) {
            const extractedCategories = await extractCategoriesFromMenuItems(allMenuItems);
            if (extractedCategories.length > 0) {
                categoriesList = extractedCategories;
                populateCategoryFilter(extractedCategories);
                populateMenuFormCategoryDropdown(extractedCategories);
            }
        }
    }
}

function populateMenuFormCategoryDropdown(categories) {
    const itemCategory = document.getElementById('itemCategory');
    if (!itemCategory) {
        return;
    }
    itemCategory.innerHTML = '<option value="">Select Category</option>';

    if (Array.isArray(categories)) {
        categories.forEach(category => {
            itemCategory.innerHTML += `<option value="${category.id}">${category.name}</option>`;
        });
    } else {}
}

async function saveMenuItem(formData) {
    try {
        // Convert FormData to a plain object for easier handling
        const formValues = {};
        formData.forEach((value, key) => {
            formValues[key] = value;
        });
        
        const itemId = formValues.id || '';
        const method = itemId ? 'PUT' : 'POST';
        const url = itemId ?
            `${API_URL}/admin/menu/${itemId}` :
            `${API_URL}/admin/menu`;
            
        // Parse tags if they exist
        let tags = [];
        try {
            tags = formValues.tags ? JSON.parse(formValues.tags) : [];
        } catch (e) {
            throw new Error('Invalid tags format'); 
        }

        // Create the request body matching the expected API format
        const requestData = {
            name: formValues.name || '',
            description: formValues.description || '',
            price_restaurant: parseFloat(formValues.restaurantPrice) || 0,
            price_room: parseFloat(formValues.roomServicePrice) || 0,
            category_id: formValues.category_id ? parseInt(formValues.category_id) : null,
            available: true,
            image_url: formValues.image_url || '',
            tags: tags
        };
        
        

        // Validate required fields with better error messages
        const errors = [];
        if (!requestData.name) errors.push('Name');
        if (!requestData.price_restaurant || isNaN(requestData.price_restaurant)) errors.push('Restaurant Price');
        if (!requestData.price_room || isNaN(requestData.price_room)) errors.push('Room Service Price');
        if (!requestData.category_id) errors.push('Category');

        if (errors.length > 0) {
            throw new Error(`Please fill in all required fields: ${errors.join(', ')}`);
        }

        // Handle image if provided
        const imageFile = formData.get('image');
        if (imageFile && imageFile.size > 0) {
            // Here you would typically upload the image first and get a URL
            // For now, we'll set a placeholder
            requestData.image_url = '/images/placeholder.jpg'; // Placeholder for now
            
            // In a real implementation, you would upload the file first:
            // 1. Create a new FormData for the file
            // 2. Upload it to your server
            // 3. Get the URL
            // 4. Set requestData.image_url to the returned URL
        }

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save menu item');
        }

        const savedItem = await response.json();

        closeItemModal();
        await loadAllMenuItems();
        showSuccess('Menu item saved successfully!');
    } catch (error) {
        showError(error.message || 'Failed to save menu item');
    }
}

async function deleteMenuItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
        const response = await fetch(`${API_URL}/admin/menu/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete menu item');
        }

        await loadAllMenuItems();
        showSuccess('Menu item deleted successfully!');
    } catch (error) {
        showError(error.message);
    }
}

// UI Functions
async function displayMenuItems(items) {
    const menuItemsGrid = document.getElementById('menuItemsGrid');

    // If we don't have categories yet, load them first
    if (categoryMap.size === 0 && categoriesList.length === 0) {
        try {
            await loadCategories();
        } catch (error) {
            showError(error.message);
        }
    }

    // Clear existing items
    menuItemsGrid.innerHTML = items.map(item => {
        /**
         *{
             "id": 232,
             "name": "Screw Driver",
             "description": "",
             "category_id": 24,
             "price_room": "6050.00",
             "price_restaurant": "6050.00",
             "available": true,
             "image_url": null,
             "tags": "[]",
             "created_at": "2025-08-06T11:23:31.000000Z",
             "updated_at": "2025-08-06T11:23:31.000000Z"
         }
         */
        const restaurantPrice = currencyFormatter.format(item.price_restaurant || 0);
        const roomServicePrice = currencyFormatter.format(item.price_room || 0);
        const categoryId = item.category_id;
        const categoryName = categoryMap.get(String(categoryId)) || 'Unknown Category';

        // Parse the tags - handle both JSON and comma-separated strings
        let tags = [];
        if (item.tags) {
            try {
                // First try to parse as JSON
                if (item.tags.startsWith('[') && item.tags.endsWith(']')) {
                    tags = JSON.parse(item.tags);
                } else if (typeof item.tags === 'string' && item.tags.includes(',')) {
                    // Handle comma-separated string
                    tags = item.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                } else if (Array.isArray(item.tags)) {
                    // Already an array
                    tags = item.tags;
                } else if (typeof item.tags === 'string' && item.tags.length > 0) {
                    // Single tag as string
                    tags = [item.tags.trim()];
                }
            } catch (e) {
                // Fallback: try to split by comma
                if (typeof item.tags === 'string') {
                    tags = item.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                }
            }
        } else {}

        return `
        <div class="item-card" data-item-id="${item.id}" data-category-id="${String(categoryId)}">
            <div class="item-card-content">
                <h3>${item.name}</h3>
                ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
                <div class="price-info">
                    <span><strong>Restaurant:</strong> ${restaurantPrice}</span>
                    <span><strong>Room Service:</strong> ${roomServicePrice}</span>
                </div>
                <div class="category-tag">
                    <span class="tag">${categoryName}</span>
                </div>
                ${tags.length > 0 ? `
                <div class="item-tags">
                    ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                ` : ''}
                <div class="item-actions">
                    <button onclick="editItem('${item.id}')" class="primary-btn">Edit</button>
                    <button onclick="deleteMenuItem('${item.id}')" class="danger-btn">Delete</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

function populateCategoryFilter(categories) {
    const filter = document.getElementById('categoryFilter');
    if (!filter) return;

    // Store current selection
    const currentValue = filter.value;

    // Clear existing options except the first one
    filter.innerHTML = '<option value="">All Categories</option>';

    // Add categories to the filter
    if (Array.isArray(categories)) {
        categories.forEach(category => {
            if (category && category.id && category.name) {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                filter.appendChild(option);
            }
        });
    }

    // Restore selection if it still exists
    if (currentValue) {
        filter.value = currentValue;
    }
}

// Update showItemModal function
async function showItemModal(item = null) {
    const modalTitle = document.getElementById('modalTitle');
    modalTitle.textContent = item ? 'Edit Menu Item' : 'Add Menu Item';

    // Ensure categories are loaded before showing modal
    if (categoriesList.length === 0) {
        try {
            await loadCategories();
        } catch (error) {
            showError('Failed to load categories. Please try again.');
            return;
        }
    }

    // Get form elements
    const nameInput = document.getElementById('itemName');
    const descriptionInput = document.getElementById('itemDescription');
    const restaurantPriceInput = document.getElementById('restaurantPrice');
    const roomServicePriceInput = document.getElementById('roomServicePrice');
    const categorySelect = document.getElementById('itemCategory');
    const tagInputs = document.querySelectorAll('input[name="tags"]');

    // Populate category dropdown
    populateMenuFormCategoryDropdown(categoriesList);


    if (item) {
        // Populate form with item data
        nameInput.value = item.name || '';
        descriptionInput.value = item.description || '';
        restaurantPriceInput.value = item.price_restaurant || '';
        roomServicePriceInput.value = item.price_room || '';
        categorySelect.value = item.category_id || '';


        // Handle tags
        tagInputs.forEach(input => {
            input.checked = item.tags && item.tags.includes(input.value);
        });

        // Add hidden input for item ID
        let idInput = document.getElementById('itemId');
        if (!idInput) {
            idInput = document.createElement('input');
            idInput.type = 'hidden';
            idInput.id = 'itemId';
            idInput.name = 'id';
            itemForm.appendChild(idInput);
        }
        idInput.value = item.id;
    } else {
        itemForm.reset();


        // Remove item ID if exists
        const idInput = document.getElementById('itemId');
        if (idInput) {
            idInput.remove();
        }
    }

    // Show modal with fade-in effect
    const modal = document.getElementById('itemModal');
    modal.style.display = 'block';
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
}

// Update closeItemModal function
function closeItemModal() {
    const modal = document.getElementById('itemModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        itemForm.reset();
    }, 200);
}

function logout() {
    localStorage.removeItem('adminToken');
    token = null;
    window.location.href = 'login.html';
}

function showError(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #dc3545;
        color: white;
        padding: 1rem;
        border-radius: 4px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showSuccess(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #28a745;
        color: white;
        padding: 1rem;
        border-radius: 4px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Update editItem function
window.editItem = async function (id) {
    try {

        // Find the item in the existing items list
        const itemCard = document.querySelector(`[data-item-id="${id}"]`);
        if (!itemCard) {
            throw new Error('Menu item not found');
        }

        // Get the item data from the data attributes
        const item = {
            id: id,
            name: itemCard.querySelector('h3').textContent,
            description: itemCard.querySelector('.item-description') ? itemCard.querySelector('.item-description').textContent : '',
            price_restaurant: parseFloat(itemCard.querySelector('.price-info span:first-child').textContent.match(/₦([\d,]+)/)[1].replace(/,/g, '')),
            price_room: parseFloat(itemCard.querySelector('.price-info span:last-child').textContent.match(/₦([\d,]+)/)[1].replace(/,/g, '')),
            category_id: itemCard.getAttribute('data-category-id'),
            tags: Array.from(itemCard.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase())
        };

        await showItemModal(item);
    } catch (error) {
        showError('Failed to load menu item. Please try again.');
    }
};

// Event Listeners
const form = document.getElementById('itemForm');
if (!form) {
    throw new Error('Could not find form with id "itemForm"');
} else {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            
            // Create FormData from the form
            const formData = new FormData(form);
            
            // Get selected tags
            const selectedTags = Array.from(document.querySelectorAll('input[name="tags"]:checked'))
                .map(checkbox => checkbox.value);
            
            // Add tags to form data
            if (selectedTags.length > 0) {
                formData.set('tags', JSON.stringify(selectedTags));
            }
            
            await saveMenuItem(formData);
        } catch (error) {
            showError('Failed to process form. Please try again.');
        }
    });
}

addItemBtn.addEventListener('click', async () => await showItemModal());
document.querySelector('#itemModal .close').addEventListener('click', closeItemModal);
window.addEventListener('click', (e) => {
    const modal = document.getElementById('itemModal');
    if (e.target === modal) {
        closeItemModal();
    }
});
logoutBtn.addEventListener('click', logout);

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.item-card');

    items.forEach(item => {
        const itemName = item.querySelector('h3').textContent.toLowerCase();
        item.style.display = itemName.includes(searchTerm) ? 'block' : 'none';
    });
});

// Add event listener for category filter
if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
        const categoryId = e.target.value;
        filterMenuItemsByCategory(categoryId);
    });
}

// Category ID to name mapping
const categoryMap = new Map();

// Initialize the dashboard
async function initializeDashboard() {
    try {
        // Load categories first
        if (categoriesList.length === 0) {
            await loadCategories();
        }

        // Update the category map with existing categories
        categoriesList.forEach(cat => {
            categoryMap.set(String(cat.id), cat.name);
        });

        // Then load menu items
        await loadAllMenuItems();

    } catch (error) {
        showError('Failed to initialize dashboard. Please refresh the page.');
    }
}

// Initialize the dashboard
if (checkAuth()) {
    setupNavigation();
    initializeDashboard().then(() => {});
}