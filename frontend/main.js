// Global menu data variable
let menuData = {
    specials: [],
    foods: [],
    drinks: []
};
import { SessionService } from './session-service.js';


// Service type handling
let currentService = null; // Always start with null to show modal
const serviceTypeSession = new SessionService('serviceType');

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

    // Section display order and African food banner images
    const sectionOrder = [
        { id: 'specials', label: "Chef's Specials", banner: 'https://img.freepik.com/free-photo/jollof-rice-with-grilled-chicken-plantains_23-2148715455.jpg' },
        { id: 'foods', label: 'Main Dishes', banner: 'https://img.freepik.com/free-photo/spicy-pepper-soup_23-2148715469.jpg' },
        { id: 'drinks', label: 'Beverages', banner: 'https://img.freepik.com/free-photo/chapman-cocktail_23-2148715484.jpg' }
    ];

    sectionOrder.forEach(({ id, label, banner }) => {
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
            <div class="section-banner" style="background-image: url('${banner}');"><h2>${label}</h2></div>
            ${Object.entries(categories).map(([cat, items]) => `
                <h3 style="margin-top:2rem;">${cat}</h3>
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

function renderCategoryScroll(categories) {
    const scrollDiv = document.querySelector('.category-scroll');
    scrollDiv.innerHTML = '';
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'category-scroll-btn';
        btn.textContent = cat.toUpperCase();
        btn.setAttribute('data-category', cat);
        btn.onclick = () => {
            const section = document.getElementById('cat-' + cat.replace(/\s+/g, '-').toLowerCase());
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };
        scrollDiv.appendChild(btn);
    });
}

// Remove old grouping and static section logic

function renderMenuByCategory(menuDataRaw) {
    const main = document.getElementById('menu-main');
    main.innerHTML = '';
    if (!Array.isArray(menuDataRaw) || !menuDataRaw.length) return;

    // Group items by category name
    const grouped = {};
    menuDataRaw.forEach(item => {
        const category = item.category_id && item.category_id.name ? item.category_id.name : 'Uncategorized';
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(item);
    });

    // Render category scroll bar
    const categories = Object.keys(grouped);
    renderCategoryScroll(categories);

    Object.entries(grouped).forEach(([category, items]) => {
        const section = document.createElement('section');
        section.className = 'menu-section';
        section.id = 'cat-' + category.replace(/\s+/g, '-').toLowerCase();
        section.innerHTML = `
            <h2 class="category-header">${category.toUpperCase()}</h2>
            <div class="menu-list">
                ${items.map(item => `
                    <div class="menu-item">
                        <span class="item-name">${item.name}</span>
                        <span class="dots"></span>
                        <span class="item-price">₦${currentService === 'room' ? (item.price_room || item.price_restaurant || '') : (item.price_restaurant || item.price_room || '')}</span>
                    </div>
                `).join('')}
            </div>
        `;
        main.appendChild(section);
    });

    // Highlight active category as user scrolls
    window.addEventListener('scroll', function () {
        let activeCat = null;
        categories.forEach(cat => {
            const section = document.getElementById('cat-' + cat.replace(/\s+/g, '-').toLowerCase());
            if (section) {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 120 && rect.bottom > 120) {
                    activeCat = cat;
                }
            }
        });
        document.querySelectorAll('.category-scroll-btn').forEach(btn => {
            if (btn.getAttribute('data-category') === activeCat) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    });
}

// Replace old renderMenu call with new one after fetching data
function fetchMenuData() {
    showLoadingState();
    fetch('https://aaet.onrender.com/api/menu')
        .then(res => res.json())
        .then(data => {
            console.log('Raw menu data received:', data);
            menuDataRaw = data;
            renderMenuByCategory(menuDataRaw);
            hideLoadingState();
        })
        .catch(err => {
            showErrorState('Failed to load menu.');
            hideLoadingState();
        });
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
    localStorage.setItem('serviceType', type);
    serviceTypeSession.set(type);  // Use the SessionService instance
    document.getElementById('serviceModal').style.display = 'none';
    renderMenuByCategory(menuDataRaw);
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
    return function (event) {
        Promise.resolve(fn(event)).catch(err => {
            console.error('Async event listener error:', err);
        });
    };
}

// Example usage for async listeners (if any):
// document.querySelector('selector').addEventListener('event', safeAsyncListener(async (e) => { ... }));

// Helper: Get query parameter from URL
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Initial setup
document.addEventListener('DOMContentLoaded', function () {
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
            img.onload = function () {
                banner.style.opacity = '1';
            };
            img.onerror = function () {
                // Fallback background if image fails to load
                banner.style.backgroundImage = 'linear-gradient(135deg, var(--accent-color), #c70512)';
            };
            img.src = url;
        }
    });

    // Check for service param in URL
    const serviceParam = getQueryParam('service');
    if (serviceParam === 'room' || serviceParam === 'restaurant') {
        currentService = serviceParam;
        document.getElementById('serviceModal').style.display = 'none';
        renderMenuByCategory(menuDataRaw);
    } else {
        // Show modal if service type not selected
        if (!currentService) {
            document.getElementById('serviceModal').style.display = 'block';
        }
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