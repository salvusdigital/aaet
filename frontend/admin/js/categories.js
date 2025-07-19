// API Configuration
const API_URL = 'http://localhost:8000/api';
let token = localStorage.getItem('adminToken');

// DOM Elements
const categoriesGrid = document.getElementById('categoriesGrid');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const categoryModal = document.getElementById('categoryModal');
const categoryForm = document.getElementById('categoryForm');
const closeModal = document.querySelector('.close');
const logoutBtn = document.getElementById('logoutBtn');
const searchInput = document.getElementById('searchCategories');
const statusFilter = document.getElementById('statusFilter');
const navLinks = document.querySelectorAll('.nav-links li');

// Check Authentication
function checkAuth() {
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
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
        case 'menu-items':
            window.location.href = 'dashboard.html';
            break;
        case 'settings':
            window.location.href = 'settings.html';
            break;
        case 'categories':
            // Already on categories page
            break;
    }
}

// API Calls
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/admin/categories`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                logout();
                return;
            }
            throw new Error('Failed to load categories');
        }

        const categories = await response.json();
        displayCategories(categories);
    } catch (error) {
        showError(error.message);
    }
}

async function saveCategory(formData) {
    try {
        const method = formData.get('id') ? 'PUT' : 'POST';
        const url = formData.get('id')
            ? `${API_URL}/admin/categories/${formData.get('id')}`
            : `${API_URL}/admin/categories`;

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to save category');
        }

        closeCategoryModal();
        loadCategories();
        showSuccess('Category saved successfully!');
    } catch (error) {
        showError(error.message);
    }
}

async function deleteCategory(id) {
    if (!confirm('Are you sure you want to delete this category? This will affect all menu items in this category.')) return;

    try {
        const response = await fetch(`${API_URL}/admin/categories/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete category');
        }

        loadCategories();
        showSuccess('Category deleted successfully!');
    } catch (error) {
        showError(error.message);
    }
}

// UI Functions
function displayCategories(categories) {
    categoriesGrid.innerHTML = categories.map(category => `
        <div class="item-card">
            <div class="category-header" style="background-color: ${category.color || '#5A5A5A'}; padding: 1rem; color: white;">
                <i class="${category.icon || 'fas fa-tag'}" style="font-size: 2rem;"></i>
                <h3>${category.name}</h3>
            </div>
            <div class="item-card-content">
                <p>${category.description || 'No description available'}</p>
                <div class="category-info">
                    <span class="status-badge ${category.status}">${category.status}</span>
                    <span class="item-count">${category.itemCount || 0} items</span>
                </div>
                <div class="item-actions">
                    <button onclick="editCategory('${category._id}')" class="primary-btn">Edit</button>
                    <button onclick="deleteCategory('${category._id}')" class="danger-btn">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function showCategoryModal(category = null) {
    const modalTitle = document.getElementById('modalTitle');
    modalTitle.textContent = category ? 'Edit Category' : 'Add Category';

    if (category) {
        // Populate form with category data
        Object.keys(category).forEach(key => {
            const input = categoryForm.elements[key];
            if (input) {
                input.value = category[key];
            }
        });
    } else {
        categoryForm.reset();
        // Set default color
        document.getElementById('categoryColor').value = '#5A5A5A';
    }

    categoryModal.style.display = 'block';
}

function closeCategoryModal() {
    categoryModal.style.display = 'none';
    categoryForm.reset();
}

function logout() {
    localStorage.removeItem('adminToken');
    token = null;
    window.location.href = 'login.html';
}

function showError(message) {
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
window.editCategory = function(id) {
    fetch(`${API_URL}/admin/categories/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(category => showCategoryModal(category))
    .catch(error => showError('Failed to load category data'));
};

// Event Listeners
categoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    saveCategory(formData);
});

addCategoryBtn.addEventListener('click', () => showCategoryModal());
closeModal.addEventListener('click', closeCategoryModal);
logoutBtn.addEventListener('click', logout);

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const categories = document.querySelectorAll('.item-card');

    categories.forEach(category => {
        const text = category.textContent.toLowerCase();
        category.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
});

statusFilter.addEventListener('change', (e) => {
    const status = e.target.value;
    if (status) {
        // Filter categories by status
        const categories = document.querySelectorAll('.item-card');
        categories.forEach(category => {
            const categoryStatus = category.querySelector('.status-badge').textContent;
            category.style.display = categoryStatus === status ? 'block' : 'none';
        });
    } else {
        // Show all categories
        const categories = document.querySelectorAll('.item-card');
        categories.forEach(category => category.style.display = 'block');
    }
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === categoryModal) {
        closeCategoryModal();
    }
});

// Initialize
checkAuth();
setupNavigation(); 