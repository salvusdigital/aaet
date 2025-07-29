// API Configuration
const API_URL = 'https://aaet.onrender.com/api';
let token = localStorage.getItem('adminToken');

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

let categoriesList = [];

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
        return;
    }
    loadMenuItems();
    loadCategories();
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

function navigateToSection(section) {
    switch(section) {
        case 'categories':
            window.location.href = 'categories.html';
            break;
        case 'settings':
            window.location.href = 'settings.html';
            break;
        case 'menu-items':
            // Already on menu items page
            break;
    }
}

// API Calls
// Extract categories from menu items as fallback
function extractCategoriesFromMenuItems(menuItems) {
    if (!Array.isArray(menuItems)) return [];
    
    const categories = new Map();
    
    menuItems.forEach(item => {
        if (item.category_id && item.category_id.name) {
            const categoryName = item.category_id.name;
            if (!categories.has(categoryName)) {
                categories.set(categoryName, {
                    _id: item.category_id._id || categoryName,
                    name: categoryName,
                    description: `Category for ${categoryName}`,
                    status: 'active',
                    createdAt: new Date().toISOString()
                });
            }
        }
    });
    
    const extractedCategories = Array.from(categories.values());
    console.log('Extracted categories from menu items:', extractedCategories);
    return extractedCategories;
}

async function loadMenuItems() {
    try {
        const response = await fetch(`${API_URL}/admin/menu`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                logout();
                return;
            }
            throw new Error('Failed to load menu items');
        }

        const items = await response.json();
        console.log('Menu items received:', items); // Log the data
        displayMenuItems(items);
        
        // If categories failed to load, extract from menu items
        if (!Array.isArray(categoriesList) || categoriesList.length === 0) {
            console.log('Categories not loaded, extracting from menu items...');
            const extractedCategories = extractCategoriesFromMenuItems(items);
            console.log('Extracted categories:', extractedCategories);
            
            if (extractedCategories.length > 0) {
                categoriesList = extractedCategories;
                populateCategoryFilter(extractedCategories);
                populateMenuFormCategoryDropdown(extractedCategories);
                console.log('Successfully populated category dropdowns with extracted categories');
            } else {
                console.warn('No categories found in menu items');
            }
        }
    } catch (error) {
        showError(error.message);
    }
}

async function loadCategories() {
    try {
        console.log('Loading categories...');
        const response = await fetch(`${API_URL}/admin/categories`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Categories response status:', response.status);
        
        if (response.ok) {
            const categories = await response.json();
            console.log('Categories loaded:', categories);
            categoriesList = categories;
            populateCategoryFilter(categories);
            populateMenuFormCategoryDropdown(categories);
        } else {
            console.error('Failed to load categories. Status:', response.status);
            
            // If API fails (500 error), try to extract from menu items
            if (response.status === 500) {
                console.log('Categories API returned 500 error, will extract from menu items...');
                // The fallback will be handled in loadMenuItems
                return;
            }
            
            const errorData = await response.json().catch(() => ({}));
            console.error('Error data:', errorData);
            showError('Failed to load categories. Please refresh the page.');
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
        // Show error to user
        showError('Failed to load categories. Please refresh the page.');
    }
}

function populateMenuFormCategoryDropdown(categories) {
    const itemCategory = document.getElementById('itemCategory');
    if (!itemCategory) return;
    itemCategory.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(category => {
        itemCategory.innerHTML += `<option value="${category._id}">${category.name}</option>`;
    });
}

async function saveMenuItem(formData) {
    try {
        const itemId = formData.get('id');
        const method = itemId ? 'PUT' : 'POST';
        const url = itemId
            ? `${API_URL}/admin/menu/${itemId}`
            : `${API_URL}/admin/menu`;

        // Get selected tags
        const selectedTags = Array.from(document.querySelectorAll('input[name="tags"]:checked'))
            .map(checkbox => checkbox.value);

        // Create the request body
        const requestData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price_restaurant: parseFloat(formData.get('restaurantPrice')),
            price_room: parseFloat(formData.get('roomServicePrice')),
            category_id: formData.get('category'),
            tags: selectedTags
        };

        // Handle image if provided
        const imageFile = formData.get('image');
        if (imageFile && imageFile.size > 0) {
            // Here you would typically upload the image first and get a URL
            // For now, we'll skip image handling
            console.log('Image file provided:', imageFile);
        }

        console.log('Saving menu item with data:', requestData);

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
        console.log('Menu item saved successfully:', savedItem);

        closeItemModal();
        loadMenuItems();
        showSuccess('Menu item saved successfully!');
    } catch (error) {
        console.error('Error saving menu item:', error);
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

        loadMenuItems();
        showSuccess('Menu item deleted successfully!');
    } catch (error) {
        showError(error.message);
    }
}

// UI Functions
function displayMenuItems(items) {
    const menuItemsGrid = document.getElementById('menuItemsGrid');
    menuItemsGrid.innerHTML = items.map(item => {
        const restaurantPrice = currencyFormatter.format(item.price_restaurant || 0);
        const roomServicePrice = currencyFormatter.format(item.price_room || 0);
        const categoryName = item.category_id ? item.category_id.name : 'Uncategorized';
        const tags = item.tags || [];

        return `
        <div class="item-card" data-item-id="${item._id}" data-category-id="${item.category_id?._id || item.category_id}">
            <div class="item-card-content">
                <h3>${item.name}</h3>
                <p>${item.description || ''}</p>
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
                    <button onclick="editItem('${item._id}')" class="primary-btn">Edit</button>
                    <button onclick="deleteMenuItem('${item._id}')" class="danger-btn">Delete</button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function populateCategoryFilter(categories) {
    console.log('Populating category filter with:', categories);
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) {
        console.error('Category filter element not found!');
        return;
    }
    
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    
    if (Array.isArray(categories) && categories.length > 0) {
        categories.forEach(category => {
            console.log('Adding category option:', category.name);
            categoryFilter.innerHTML += `<option value="${category.name}">${category.name}</option>`;
        });
        console.log('Category filter populated with', categories.length, 'categories');
    } else {
        console.warn('No categories to populate or categories is not an array');
    }
}

// Update showItemModal function
function showItemModal(item = null) {
    console.log('Opening modal with item data:', item);
    const modalTitle = document.getElementById('modalTitle');
    modalTitle.textContent = item ? 'Edit Menu Item' : 'Add Menu Item';

    // Get form elements
    const nameInput = document.getElementById('itemName');
    const descriptionInput = document.getElementById('itemDescription');
    const restaurantPriceInput = document.getElementById('restaurantPrice');
    const roomServicePriceInput = document.getElementById('roomServicePrice');
    const categorySelect = document.getElementById('itemCategory');
    const tagInputs = document.querySelectorAll('input[name="tags"]');

    if (item) {
        console.log('Populating form with item:', item);
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
        idInput.value = item._id;
    } else {
        console.log('Resetting form for new item');
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
        console.log('Editing item with ID:', id);

        // Find the item in the existing items list
        const itemCard = document.querySelector(`[data-item-id="${id}"]`);
        if (!itemCard) {
            throw new Error('Menu item not found');
        }

        // Get the item data from the data attributes
        const item = {
            _id: id,
            name: itemCard.querySelector('h3').textContent,
            description: itemCard.querySelector('p').textContent,
            price_restaurant: parseFloat(itemCard.querySelector('.price-info span:first-child').textContent.match(/₦([\d,]+)/)[1].replace(/,/g, '')),
            price_room: parseFloat(itemCard.querySelector('.price-info span:last-child').textContent.match(/₦([\d,]+)/)[1].replace(/,/g, '')),
            category_id: itemCard.getAttribute('data-category-id'),
            tags: Array.from(itemCard.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase())
        };

        console.log('Found item data:', item);
        showItemModal(item);
    } catch (error) {
        console.error('Error editing item:', error);
        showError('Failed to load menu item. Please try again.');
    }
};

// Event Listeners
itemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    saveMenuItem(formData);
});

addItemBtn.addEventListener('click', () => showItemModal());
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

categoryFilter.addEventListener('change', (e) => {
    const category = e.target.value;
    if (category) {
        // Filter items by category
        const items = document.querySelectorAll('.item-card');
        items.forEach(item => {
            const itemCategory = item.querySelector('.category-tag .tag').textContent;
            item.style.display = itemCategory === category ? 'block' : 'none';
        });
    } else {
        // Show all items
        const items = document.querySelectorAll('.item-card');
        items.forEach(item => item.style.display = 'block');
    }
});

// Initialize
checkAuth();
setupNavigation(); 