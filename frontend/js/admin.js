import SessionService from './services/session-service.js';
import config from './config/config.js';

// API Configuration
const API_URL = config.api.baseUrl;
const authSession = new SessionService('adminAuth');
let token = authSession.get();

// Make functions available globally for onclick handlers
window.deleteMenuItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
        await apiRequest(`/admin/menu/${id}`, {
            method: 'DELETE'
        });
        loadMenuItems();
    } catch (error) {
        handleError(error, 'Delete menu item');
    }
};

window.editItem = async (id) => {
    try {
        const item = await apiRequest(`/admin/menu/${id}`);
        showItemModal(item);
    } catch (error) {
        handleError(error, 'Load menu item');
    }
};

// Error handling utility
const handleError = (error, context) => {
    if (config.features.debugMode) {
        console.error(`${context} error:`, error);
    }

    // User-friendly error message
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    alert(message);
};

// API utility for making authenticated requests
async function apiRequest(endpoint, options = {}) {
    try {
        const url = `${API_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers,
            signal: AbortSignal.timeout(config.api.timeout)
        });

        if (!response.ok) {
            if (response.status === 401) {
                logout();
                throw new Error('Session expired. Please login again.');
            }
            throw new Error(`Request failed with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        handleError(error, `API request to ${endpoint}`);
        throw error;
    }
}

// DOM Elements
const loginForm = document.getElementById('loginForm');
const adminDashboard = document.getElementById('adminDashboard');
const itemsGrid = document.getElementById('menuItemsGrid');
const addItemBtn = document.getElementById('addItemBtn');
const itemModal = document.getElementById('itemModal');
const itemForm = document.getElementById('itemForm');
const closeModal = document.querySelector('.close');
const logoutBtn = document.getElementById('logoutBtn');
const searchInput = document.getElementById('searchItems');
const categoryFilter = document.getElementById('categoryFilter');

// Check Authentication
function checkAuth() {
    token = authSession.get();
    if (!token) {
        showLoginForm();
    } else {
        showDashboard();
        loadMenuItems();
    }
}

// Start session expiry check
authSession.startExpiryCheck(() => {
    token = null;
    showLoginForm();
});

// Show/Hide Functions
function showLoginForm() {
    loginForm.style.display = 'flex';
    adminDashboard.style.display = 'none';
}

function showDashboard() {
    loginForm.style.display = 'none';
    adminDashboard.style.display = 'flex';
}

// API Calls
async function login(username, password) {
    try {
        const data = await apiRequest('/admin/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        token = data.token;
        authSession.set(token);
        showDashboard();
        loadMenuItems();
    } catch (error) {
        handleError(error, 'Login');
    }
}

async function loadMenuItems(category = '') {
    try {
        const endpoint = category ? `/admin/menu?category=${category}` : '/admin/menu';
        const items = await apiRequest(endpoint);
        displayMenuItems(items);
    } catch (error) {
        handleError(error, 'Load menu items');
    }
}

async function saveMenuItem(formData) {
    try {
        const method = formData.get('id') ? 'PUT' : 'POST';
        const endpoint = formData.get('id')
            ? `/admin/menu/${formData.get('id')}`
            : '/admin/menu';

        await apiRequest(endpoint, {
            method,
            body: formData
        });

        closeItemModal();
        loadMenuItems();
    } catch (error) {
        handleError(error, 'Save menu item');
    }
}

// UI Functions
function displayMenuItems(items) {
    itemsGrid.innerHTML = items.map(item => `
        <div class="item-card">
            <img src="${item.image || 'placeholder.jpg'}" alt="${item.name}">
            <div class="item-card-content">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="price-info">
                    <span>Restaurant: ₦${item.price?.restaurant?.toLocaleString() || 'N/A'}</span>
                    <span>Room Service: ₦${item.price?.room?.toLocaleString() || 'N/A'}</span>
                </div>
                <div class="item-actions">
                    <button onclick="editItem('${item._id}')" class="primary-btn">Edit</button>
                    <button onclick="deleteMenuItem('${item._id}')" class="danger-btn">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function showItemModal(item = null) {
    const modalTitle = document.getElementById('modalTitle');
    modalTitle.textContent = item ? 'Edit Menu Item' : 'Add Menu Item';

    if (item) {
        // Populate form with item data
        itemForm.elements.name.value = item.name || '';
        itemForm.elements.description.value = item.description || '';
        itemForm.elements.restaurantPrice.value = item.price?.restaurant || '';
        itemForm.elements.roomServicePrice.value = item.price?.room || '';
        itemForm.elements.category.value = item.category || '';
        if (item._id) {
            itemForm.elements.id.value = item._id;
        }
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
    authSession.clear();
    token = null;
    showLoginForm();
}

// Event Listeners
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    login(username, password);
});

itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Structure the data correctly
    const menuItemData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: {
            restaurant: Number(formData.get('restaurantPrice')),
            room: Number(formData.get('roomServicePrice'))
        },
        category: formData.get('category')
    };

    // Add ID if it exists
    const id = formData.get('id');
    if (id) {
        menuItemData.id = id;
    }

    // Handle image file if provided
    const imageFile = formData.get('image');
    if (imageFile && imageFile.size > 0) {
        menuItemData.image = imageFile;
    }

    try {
        const method = id ? 'PUT' : 'POST';
        const endpoint = id ? `/admin/menu/${id}` : '/admin/menu';

        // Use FormData for multipart/form-data (needed for file upload)
        const submitFormData = new FormData();
        Object.entries(menuItemData).forEach(([key, value]) => {
            if (key === 'price') {
                submitFormData.append('price', JSON.stringify(value));
            } else {
                submitFormData.append(key, value);
            }
        });

        await apiRequest(endpoint, {
            method,
            body: submitFormData,
            headers: {} // Let browser set content-type for FormData
        });

        closeItemModal();
        loadMenuItems();
    } catch (error) {
        handleError(error, 'Save menu item');
    }
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
    loadMenuItems(category);
});

// Initialize
if (config.security.requireHttps && window.location.protocol === 'http:') {
    window.location.href = window.location.href.replace('http:', 'https:');
} else {
    checkAuth();
} 