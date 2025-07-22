// Global menu data variable
let menuData = {
    specials: [],
    foods: [],
    drinks: []
};

// Service type handling
let currentService = null; // Always start with null to show modal

// Group menu items by category name
function groupMenuByCategory(items) {
    const grouped = {};
    items.forEach(item => {
        const category = item.category_id && item.category_id.name ? item.category_id.name : 'Uncategorized';
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(item);
    });
    return grouped;
}

// Remove static sections for Chef Special, Main Dishes, and Beverages if present
function removeStaticMenuSections() {
    ['specials', 'foods', 'drinks'].forEach(id => {
        const section = document.getElementById(id);
        if (section) section.remove();
    });
}

// Helper: Map category name to main section
function getMainSection(categoryName) {
    const name = categoryName.toLowerCase();
    if (/snack|grill|platter|special/.test(name)) return 'specials';
    if (/soup|rice|main|dish|pepper|food|entree/.test(name)) return 'foods';
    if (/drink|juice|cocktail|beverage|smoothie|wine|beer/.test(name)) return 'drinks';
    return 'others';
}

// Render menu sections grouped by main section
function renderMenu() {
    removeStaticMenuSections();
    const menuGridContainer = document.querySelector('main') || document.body;
    // Remove old dynamic sections
    document.querySelectorAll('.dynamic-menu-section').forEach(el => el.remove());

    // Group items by main section and then by category
    const grouped = { specials: {}, foods: {}, drinks: {}, others: {} };
    menuDataRaw.forEach(item => {
        const category = item.category_id && item.category_id.name ? item.category_id.name : 'Uncategorized';
        const mainSection = getMainSection(category);
        if (!grouped[mainSection][category]) grouped[mainSection][category] = [];
        grouped[mainSection][category].push(item);
    });

    // Section display order
    const sectionOrder = [
        { id: 'specials', label: "Chef's Specials" },
        { id: 'foods', label: 'Main Dishes' },
        { id: 'drinks', label: 'Beverages' }
    ];

    sectionOrder.forEach(({ id, label }) => {
        const categories = grouped[id];
        const allItems = Object.values(categories).flat();
        if (!allItems.length) return;
        // Create anchor for navbar
        const anchor = document.createElement('a');
        anchor.id = id;
        menuGridContainer.insertBefore(anchor, menuGridContainer.firstChild);
        // Create section
        const section = document.createElement('section');
        section.className = 'section dynamic-menu-section';
        section.innerHTML = `
            <div class="section-banner"><h2>${label}</h2></div>
            ${Object.entries(categories).map(([cat, items]) => `
                <h3 style="margin-top:1rem;">${cat}</h3>
                <div class="menu-grid">
                    ${items.map(item => `
                        <div class="menu-item">
                            <div class="menu-item-header">
                                <h3>${item.name}</h3>
                                <span class="price">
                                    ₦${currentService === 'room'
                                        ? (item.price_room || item.price_restaurant || '')
                                        : (item.price_restaurant || item.price_room || '')}
                                </span>
                            </div>
                            <p>${item.description || ''}</p>
                            ${item.tags && item.tags.length ? `<div class="menu-item-tags">${item.tags.map(tag => `<span class='menu-item-tag'>${tag}</span>`).join('')}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        `;
        // Insert before footer
        const footer = document.querySelector('footer');
        menuGridContainer.insertBefore(section, footer);
    });
}

// Store raw menu data globally
let menuDataRaw = [];

// Fetch menu data from API
async function fetchMenuData() {
    try {
        showLoadingState();
        const response = await fetch('https://aaet.onrender.com/api/menu');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Raw menu data received:', data);
        menuDataRaw = data;
        hideLoadingState();
        renderMenu();
        console.log('Menu data loaded and rendered by category:', menuDataRaw);
    } catch (error) {
        console.error('Error fetching menu data:', error);
        hideLoadingState();
        showErrorState();
        menuDataRaw = [];
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

// Fetch menu data from /api/menu and log the response
async function fetchAndLogMenuData() {
    try {
        const response = await fetch('https://aaet.onrender.com/api/menu');
        const data = await response.json();
        console.log('Menu data from /api/menu:', data);
    } catch (error) {
        console.error('Error fetching /api/menu:', error);
    }
}

// Wrap async event listeners to catch errors
function safeAsyncListener(fn) {
    return function(event) {
        Promise.resolve(fn(event)).catch(err => {
            console.error('Async event listener error:', err);
        });
    };
}

// Example usage for async listeners (if any):
// document.querySelector('selector').addEventListener('event', safeAsyncListener(async (e) => { ... }));

// Initial setup
document.addEventListener('DOMContentLoaded', function() {
    fetchAndLogMenuData();
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