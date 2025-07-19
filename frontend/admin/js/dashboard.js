// API Configuration
const API_URL = 'http://localhost:8000/api';
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
            populateCategoryFilter(categories);
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

async function saveMenuItem(formData) {
    try {
        const method = formData.get('id') ? 'PUT' : 'POST';
        const url = formData.get('id')
            ? `${API_URL}/admin/menu/${formData.get('id')}`
            : `${API_URL}/admin/menu`;

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to save menu item');
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
    itemsGrid.innerHTML = items.map(item => `
        <div class="item-card">
            <img src="${item.image || '../images/placeholder.jpg'}" alt="${item.name}" onerror="this.src='../images/placeholder.jpg'">
            <div class="item-card-content">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="price-info">
                    <span><strong>Restaurant:</strong> $${item.restaurantPrice}</span>
                    <span><strong>Room Service:</strong> $${item.roomServicePrice}</span>
                </div>
                <div class="category-tag">
                    <span class="tag">${item.category || 'Uncategorized'}</span>
                </div>
                <div class="item-actions">
                    <button onclick="editItem('${item._id}')" class="primary-btn">Edit</button>
                    <button onclick="deleteMenuItem('${item._id}')" class="danger-btn">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
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
        Object.keys(item).forEach(key => {
            const input = itemForm.elements[key];
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = item[key] && item[key].includes(input.value);
                } else {
                    input.value = item[key];
                }
            }
        });
    } else {
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
window.editItem = function(id) {
    // Fetch item data and show modal
    fetch(`${API_URL}/admin/menu/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(item => showItemModal(item))
    .catch(error => showError('Failed to load item data'));
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