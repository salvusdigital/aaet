// API Configuration
const API_URL = 'https://aaet.onrender.com/api';
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

        if (categoriesWithCounts.length === 0) {
            categoriesGrid.innerHTML = `
                <div class="no-data-message">
                    <p>No categories found. Click the "Add Category" button to create one.</p>
                </div>
            `;
            return;
        }

        console.log('Categories with counts:', categoriesWithCounts);
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
    categoriesGrid.innerHTML = `
        <table class="categories-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Items</th>
                    <th style="width: 150px;"></th>
                </tr>
            </thead>
            <tbody>
                ${categories.map(category => `
                    <tr data-category-id="${category._id}">
                        <td>
                            <div class="category-name">
                                <span class="color-indicator" style="background-color: ${category.color || '#5A5A5A'}"></span>
                                ${category.name}
                            </div>
                        </td>
                        <td class="category-description">${category.description || 'No description available'}</td>
                        <td><span class="status-badge ${category.status || 'active'}">${category.status || 'active'}</span></td>
                        <td class="item-count">${category.itemCount || 0}</td>
                        <td class="action-buttons">
                            <button onclick="editCategory('${category._id}')" class="icon-btn edit-btn" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteCategory('${category._id}')" class="icon-btn delete-btn" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function showCategoryModal(category = null) {
    console.log('Opening modal with category data:', category);
    const modalTitle = document.getElementById('modalTitle');
    modalTitle.textContent = category ? 'Edit Category' : 'Add Category';

    // Get form elements
    const nameInput = document.getElementById('categoryName');
    const descriptionInput = document.getElementById('categoryDescription');
    const iconInput = document.getElementById('categoryIcon');
    const colorInput = document.getElementById('categoryColor');
    const statusInput = document.getElementById('categoryStatus');

    if (category) {
        console.log('Populating form with category:', category);
        // Populate form with category data
        nameInput.value = category.name || '';
        descriptionInput.value = category.description || '';
        iconInput.value = category.icon || '';
        colorInput.value = category.color || '#5A5A5A';
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
        colorInput.value = '#5A5A5A';
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
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Global functions for onclick handlers
window.editCategory = async function (id) {
    try {
        console.log('Editing category with ID:', id);
        const categoryRow = document.querySelector(`[data-category-id="${id}"]`);
        if (!categoryRow) {
            throw new Error('Category not found in DOM');
        }

        console.log('Found category row:', categoryRow);
        const categoryData = {
            _id: id,
            name: categoryRow.querySelector('.category-name').textContent.trim(),
            description: categoryRow.querySelector('.category-description').textContent.trim(),
            status: categoryRow.querySelector('.status-badge').textContent.trim(),
            color: categoryRow.querySelector('.color-indicator').style.backgroundColor || '#5A5A5A'
        };

        console.log('Extracted category data:', categoryData);
        showCategoryModal(categoryData);
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