// API Configuration
const API_URL = 'https://aaet.onrender.com/api';
let token = localStorage.getItem('adminToken');
let allCategories = []; // Store all categories for filtering

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
    switch (section) {
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
        // First check if we have a valid token
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

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
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to load categories');
        }

        const categories = await response.json();

        // Fetch menu items count for each category
        const categoriesWithCounts = await Promise.all(categories.map(async (category) => {
            try {
                const itemsResponse = await fetch(`${API_URL}/menu/category/${category._id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!itemsResponse.ok) {
                    console.error(`Error fetching items for category ${category.name}: ${itemsResponse.status}`);
                    return {
                        ...category,
                        itemCount: '?'
                    };
                }

                const items = await itemsResponse.json();
                return {
                    ...category,
                    itemCount: items.length
                };
            } catch (error) {
                console.error(`Error fetching items for category ${category.name}:`, error);
                return {
                    ...category,
                    itemCount: '?'
                };
            }
        }));

        console.log('Categories with counts:', categoriesWithCounts);
        allCategories = categoriesWithCounts; // Store for filtering
        displayCategories(categoriesWithCounts);
    } catch (error) {
        console.error('Error in loadCategories:', error);
        showError(error.message || 'Failed to load categories. Please try refreshing the page.');

        // Show user-friendly empty state
        categoriesGrid.innerHTML = `
            <div class="error-message">
                <p>Unable to load categories. Please try again later.</p>
                <button onclick="loadCategories()" class="primary-btn">
                    <i class="fas fa-sync"></i> Retry
                </button>
            </div>
        `;
    }
}

async function saveCategory(formData) {
    try {
        console.log('Saving category with data:', Object.fromEntries(formData));
        const categoryId = formData.get('id');
        const method = categoryId ? 'PUT' : 'POST';
        const url = categoryId
            ? `${API_URL}/admin/categories/${categoryId}`
            : `${API_URL}/admin/categories`;

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save category');
        }

        const savedCategory = await response.json();
        console.log('Category saved successfully:', savedCategory);

        closeCategoryModal();
        loadCategories();
        showSuccess('Category saved successfully!');
    } catch (error) {
        console.error('Error saving category:', error);
        showError(error.message || 'Failed to save category');
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
    if (categories.length === 0) {
        categoriesGrid.innerHTML = `
            <div class="no-data-message">
                <i class="fas fa-tags"></i>
                <h3>No categories found</h3>
                <p>Click the "Add Category" button to create your first category.</p>
            </div>
        `;
        return;
    }

    categoriesGrid.innerHTML = `
        <div class="categories-grid">
            ${categories.map(category => `
                <div class="category-card" data-category-id="${category._id}">
                    <div class="category-header">
                        <h3 class="category-name">${category.name}</h3>
                        <span class="status-badge ${category.status || 'active'}">${category.status || 'active'}</span>
                    </div>
                    <div class="category-content">
                        <p class="category-description">${category.description || 'No description available'}</p>
                        <div class="category-stats">
                            <span class="item-count">
                                <i class="fas fa-utensils"></i>
                                ${category.itemCount || 0} items
                            </span>
                            <span class="category-date">
                                <i class="fas fa-calendar"></i>
                                ${new Date(category.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <div class="category-actions">
                        <button onclick="editCategory('${category._id}')" class="icon-btn edit-btn" title="Edit Category">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteCategory('${category._id}')" class="icon-btn delete-btn" title="Delete Category">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Search and Filter Functions
function filterCategories() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilterValue = statusFilter.value;

    let filteredCategories = allCategories.filter(category => {
        const matchesSearch = category.name.toLowerCase().includes(searchTerm) ||
                            (category.description && category.description.toLowerCase().includes(searchTerm));
        
        const matchesStatus = !statusFilterValue || category.status === statusFilterValue;
        
        return matchesSearch && matchesStatus;
    });

    displayCategories(filteredCategories);
    
    // Update results count
    updateResultsCount(filteredCategories.length);
}

function clearFilters() {
    searchInput.value = '';
    statusFilter.value = '';
    filterCategories();
}

function updateResultsCount(count) {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = `${count} category${count !== 1 ? 'ies' : ''} found`;
    }
}

function showCategoryModal(category = null) {
    console.log('Opening modal with category data:', category);
    const modalTitle = document.getElementById('modalTitle');
    modalTitle.textContent = category ? 'Edit Category' : 'Add Category';

    // Get form elements
    const nameInput = document.getElementById('categoryName');
    const descriptionInput = document.getElementById('categoryDescription');
    const statusInput = document.getElementById('categoryStatus');

    if (category) {
        console.log('Populating form with category:', category);
        // Populate form with category data
        nameInput.value = category.name || '';
        descriptionInput.value = category.description || '';
        statusInput.value = category.status || 'active';

        // Add hidden input for category ID
        let idInput = document.getElementById('categoryId');
        if (!idInput) {
            idInput = document.createElement('input');
            idInput.type = 'hidden';
            idInput.id = 'categoryId';
            idInput.name = 'id';
            categoryForm.appendChild(idInput);
        }
        idInput.value = category._id;
    } else {
        console.log('Resetting form for new category');
        categoryForm.reset();
        // Remove category ID if exists
        const idInput = document.getElementById('categoryId');
        if (idInput) {
            idInput.remove();
        }
        // Set default values
        statusInput.value = 'active';
    }

    // Show modal with fade-in effect
    const modal = document.getElementById('categoryModal');
    modal.style.display = 'block';
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

function closeCategoryModal() {
    const modal = document.getElementById('categoryModal');
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
        categoryForm.reset();
    }, 200);
}

function logout() {
    localStorage.removeItem('adminToken');
    token = null;
    window.location.href = 'login.html';
}

function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Global functions for onclick handlers
window.editCategory = async function (id) {
    try {
        console.log('Editing category with ID:', id);
        const category = allCategories.find(cat => cat._id === id);
        
        if (!category) {
            throw new Error('Category not found');
        }

        console.log('Found category:', category);
        showCategoryModal(category);
    } catch (error) {
        console.error('Error editing category:', error);
        showError('Failed to load category data. Please try again.');
    }
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

// Search and filter event listeners
searchInput.addEventListener('input', filterCategories);
statusFilter.addEventListener('change', filterCategories);

// Clear filters button
const clearFiltersBtn = document.getElementById('clearFilters');
if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearFilters);
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === categoryModal) {
        closeCategoryModal();
    }
});

// Initialize
checkAuth();
setupNavigation(); 