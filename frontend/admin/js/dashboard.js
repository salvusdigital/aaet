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
    switch (section) {
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
    } catch (error) {
        showError(error.message);
    }
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/admin/categories`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const categories = await response.json();
            categoriesList = categories;
            populateCategoryFilter(categories);
            populateMenuFormCategoryDropdown(categories);
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
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
        const id = formData.get('id');
        const method = id ? 'PUT' : 'POST';
        const url = id
            ? `${API_URL}/admin/menu/${id}`
            : `${API_URL}/admin/menu`;

        // Build the correct data structure
        const data = {
            name: formData.get('name'),
            description: formData.get('description'),
            category_id: formData.get('category'),
            price_room: formData.get('roomServicePrice'),
            price: formData.get('restaurantPrice'), // fallback for legacy
            price_restaurant: formData.get('restaurantPrice'),
            available: true, // or get from form if you have a toggle
            image_url: '', // handle image upload if needed
            image: '', // handle image upload if needed
            tags: Array.from(formData.getAll('tags'))
        };

        console.log('Sending menu item data:', data);

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json().catch(() => null);
        console.log('Server response:', responseData);

        if (!response.ok) {
            throw new Error((responseData && responseData.message) || 'Failed to save menu item');
        }

        closeItemModal();
        loadMenuItems();
        showSuccess('Menu item saved successfully!');
    } catch (error) {
        showError(error.message);
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
    itemsGrid.innerHTML = items.map(item => {
        // Use correct property names for prices and category
        const restaurantPrice = item.price_restaurant !== undefined ? item.price_restaurant : 'N/A';
        const roomServicePrice = item.price_room !== undefined ? item.price_room : 'N/A';
        const categoryName = item.category_id && item.category_id.name ? item.category_id.name : 'Uncategorized';
        return `
        <div class="item-card">
            <div class="item-card-content">
                <h3>${item.name}</h3>
                <p>${item.description || ''}</p>
                <div class="price-info">
                    <span><strong>Restaurant:</strong> ₦${restaurantPrice}</span>
                    <span><strong>Room Service:</strong> ₦${roomServicePrice}</span>
                </div>
                <div class="category-tag">
                    <span class="tag">${categoryName}</span>
                </div>
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
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
        categoryFilter.innerHTML += `<option value="${category.name}">${category.name}</option>`;
    });
}

function showItemModal(item = null) {
    const modalTitle = document.getElementById('modalTitle');
    modalTitle.textContent = item ? 'Edit Menu Item' : 'Add Menu Item';

    if (item) {
        // Populate form with item data
        itemForm.reset();
        itemForm.elements['name'].value = item.name || '';
        itemForm.elements['description'].value = item.description || '';
        itemForm.elements['restaurantPrice'].value = item.price_restaurant || '';
        itemForm.elements['roomServicePrice'].value = item.price_room || '';
        itemForm.elements['category'].value = item.category_id && item.category_id._id ? item.category_id._id : (item.category_id || '');
        // Set tags
        const tags = Array.isArray(item.tags) ? item.tags : [];
        Array.from(itemForm.elements['tags']).forEach(checkbox => {
            checkbox.checked = tags.includes(checkbox.value);
        });
        // Set id for editing
        if (!itemForm.elements['id']) {
            const hiddenId = document.createElement('input');
            hiddenId.type = 'hidden';
            hiddenId.name = 'id';
            hiddenId.value = item._id;
            itemForm.appendChild(hiddenId);
        } else {
            itemForm.elements['id'].value = item._id;
        }
    } else {
        // Remove id field if present
        if (itemForm.elements['id']) {
            itemForm.elements['id'].remove();
        }
        itemForm.reset();
    }
    itemModal.style.display = 'block';
}

function closeItemModal() {
    itemModal.style.display = 'none';
    itemForm.reset();
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

// Global functions for onclick handlers
window.editItem = async function(id) {
    try {
        const response = await fetch(`${API_URL}/admin/menu/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch menu item');
        }
        const item = await response.json();
        showItemModal(item);
    } catch (error) {
        showError(error.message);
    }
};

// Event Listeners
itemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    saveMenuItem(formData);
});

addItemBtn.addEventListener('click', () => showItemModal());
closeModal.addEventListener('click', closeItemModal);
logoutBtn.addEventListener('click', logout);

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.item-card');

    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? 'block' : 'none';
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

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === itemModal) {
        closeItemModal();
    }
});

// Initialize
checkAuth();
setupNavigation(); 