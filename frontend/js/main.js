// Global menu data variable
let menuData = {
    specials: [],
    foods: [],
    drinks: []
};

// Service type handling
let currentService = null; // Always start with null to show modal

// Fetch menu data from API
async function fetchMenuData() {
    try {
        // Show loading state
        showLoadingState();
        
        const response = await fetch('https://aaet.onrender.com/api/menu');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Process the data and categorize items
        menuData = {
            specials: data.filter(item => item.category === 'specials' && item.isActive),
            foods: data.filter(item => item.category === 'foods' && item.isActive),
            drinks: data.filter(item => item.category === 'drinks' && item.isActive)
        };
        
        // Hide loading state
        hideLoadingState();
        
        // Render menu if service type is already selected
        if (currentService) {
            renderMenu();
        }
        
        console.log('Menu data loaded successfully:', menuData);
    } catch (error) {
        console.error('Error fetching menu data:', error);
        // Hide loading state
        hideLoadingState();
        // Show error state
        showErrorState();
        // Fallback to empty data if API fails
        menuData = { specials: [], foods: [], drinks: [] };
    }
}

// Show loading state
function showLoadingState() {
    const sections = ['#specials', '#foods', '#drinks'];
    sections.forEach(selector => {
        const grid = document.querySelector(`${selector} .menu-grid`);
        if (grid) {
            grid.innerHTML = '<div class="loading">Loading menu items...</div>';
        }
    });
}

// Hide loading state
function hideLoadingState() {
    // Loading state will be replaced when renderMenu() is called
}

// Show error state
function showErrorState() {
    const sections = ['#specials', '#foods', '#drinks'];
    sections.forEach(selector => {
        const grid = document.querySelector(`${selector} .menu-grid`);
        if (grid) {
            grid.innerHTML = '<div class="error">Unable to load menu items. Please try again later.</div>';
        }
    });
}



// Service selection handler
function selectService(type) {
    currentService = type;
    document.getElementById('serviceModal').style.display = 'none';
    renderMenu();
}

// Format price with currency
function formatPrice(price) {
    return `₦${price.toLocaleString()}`;
}

// Create menu item HTML with list-style layout (Cristiano style)
function createMenuItemHTML(item) {
    const price = currentService === 'room' ? item.price.room : item.price.restaurant;
    const tagsHTML = item.tags ? item.tags.map(tag => `<span class="menu-item-tag">${tag}</span>`).join('') : '';
    
    return `
        <div class="menu-item">
            <div class="menu-item-header">
                <h3>${item.name}</h3>
                <span class="price">₦${price.toLocaleString()}</span>
            </div>
            <p>${item.description}</p>
            ${tagsHTML ? `<div class="menu-item-tags">${tagsHTML}</div>` : ''}
        </div>
    `;
}

// Show item details (can be expanded later for modal or detailed view)
function showItemDetails(itemId) {
    // Find the item
    const allItems = [...menuData.specials, ...menuData.foods, ...menuData.drinks];
    const item = allItems.find(item => item._id === itemId);
    
    if (item) {
        // For now, just log the item details
        // This can be expanded to show a modal with more details
        console.log('Item details:', item);
        
        // You can add a modal here to show more details
        // showItemModal(item);
    }
}

// Render menu sections
function renderMenu() {
    // Render specials
    const specialsGrid = document.querySelector('#specials .menu-grid');
    if (menuData.specials.length > 0) {
        specialsGrid.innerHTML = menuData.specials.map(item => createMenuItemHTML(item)).join('');
    } else {
        specialsGrid.innerHTML = '<div class="empty-state">No specials available at the moment.</div>';
    }

    // Render foods
    const foodsGrid = document.querySelector('#foods .menu-grid');
    if (menuData.foods.length > 0) {
        foodsGrid.innerHTML = menuData.foods.map(item => createMenuItemHTML(item)).join('');
    } else {
        foodsGrid.innerHTML = '<div class="empty-state">No main dishes available at the moment.</div>';
    }

    // Render drinks
    const drinksGrid = document.querySelector('#drinks .menu-grid');
    if (menuData.drinks.length > 0) {
        drinksGrid.innerHTML = menuData.drinks.map(item => createMenuItemHTML(item)).join('');
    } else {
        drinksGrid.innerHTML = '<div class="empty-state">No beverages available at the moment.</div>';
    }
}

// Initial setup
document.addEventListener('DOMContentLoaded', function() {
    // Fetch menu data when page loads
    fetchMenuData();
    
    // Add loading state for section banner images
    const sectionBanners = document.querySelectorAll('.section-banner');
    sectionBanners.forEach(banner => {
        const backgroundImage = banner.style.backgroundImage;
        if (backgroundImage) {
            const url = backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
            const img = new Image();
            img.onload = function() {
                banner.style.opacity = '1';
            };
            img.onerror = function() {
                // Fallback background if image fails to load
                banner.style.backgroundImage = 'linear-gradient(135deg, var(--accent-color), #c70512)';
            };
            img.src = url;
        }
    });

    // Show modal if service type not selected
    if (!currentService) {
        document.getElementById('serviceModal').style.display = 'block';
    }
});



// Navigation active state
const navLinks = document.querySelectorAll('.nav-links a');
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        navLinks.forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}); 