/**
 * Restaurant Menu Application
 * 
 * This application manages a restaurant menu with categories, filtering, and service selection.
 * The code is organized into clear sections for easy understanding and maintenance.
 */

// ============================================================================
// GLOBAL STATE MANAGEMENT
// ============================================================================

/**
 * Application state - all global variables in one place for easy management
 */
const AppState = {
    // Menu data
    menuData: {
        specials: [],
        foods: [],
        drinks: []
    },
    rawMenuData: [], // Raw data from API

    // Service and filtering
    currentService: null, // 'room' or 'restaurant'
    currentFilter: 'food', // Current active filter

    // Categories
    allCategories: [], // Categories from API
    categoryGroups: ['FOOD', 'DRINKS'] // Available category groups
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format price with commas for better readability
 * @param {number|string} price - The price to format
 * @returns {string} Formatted price string
 */
function formatPrice(price) {
    if (price === null || price === undefined || price === '') return '';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Get the appropriate price based on current service type
 * @param {Object} item - Menu item with price_room and price_restaurant
 * @returns {string} Formatted price string
 */
function getItemPrice(item) {
    // Debug: Log the item structure to understand the price format
    if (!item.price_room && !item.price_restaurant) {
        console.warn('Menu item missing price data:', item);
    }

    const price = AppState.currentService === 'room'
        ? (item.price_room || item.price_restaurant || '')
        : (item.price_restaurant || item.price_room || '');

    return `₦${formatPrice(price)}`;
}

/**
 * Get query parameter from URL
 * @param {string} name - Parameter name
 * @returns {string|null} Parameter value
 */
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * Create a safe event listener that catches errors
 * @param {Function} fn - Function to wrap
 * @returns {Function} Safe event listener
 */
function createSafeEventListener(fn) {
    return function (event) {
        Promise.resolve(fn(event)).catch(err => {
            console.error('Event listener error:', err);
        });
    };
}

// ============================================================================
// CATEGORY MANAGEMENT
// ============================================================================

/**
 * Category classification patterns
 */
const CategoryPatterns = {
    FOOD: /starter|pepper soup|nigerian dish|grill|continental|sandwich|burger|pizza|chinese|indian|pasta|dessert|nigerian meal|snack|kids|extra/,
    DRINKS: /non alcoholic|coffee|wine|beer|spirit|champagne|cocktail|mocktail/
};

/**
 * Determine which group a category belongs to
 * @param {string} categoryName - Name of the category
 * @returns {string} Group name ('FOOD' or 'DRINKS')
 */
function classifyCategory(categoryName) {
    const name = categoryName.toLowerCase();

    if (CategoryPatterns.FOOD.test(name)) return 'FOOD';
    if (CategoryPatterns.DRINKS.test(name)) return 'DRINKS';

    return 'FOOD'; // Default to FOOD if unsure
}

/**
 * Extract categories from menu data when API categories are not available
 * @param {Array} menuData - Raw menu data
 * @returns {Array} Array of category objects
 */
function extractCategoriesFromMenu(menuData) {
    if (!Array.isArray(menuData)) return [];

    const categories = new Map();

    menuData.forEach(item => {
        if (item.category_id && item.category_id.name) {
            const categoryName = item.category_id.name;
            if (!categories.has(categoryName)) {
                categories.set(categoryName, {
                    name: categoryName,
                    group: classifyCategory(categoryName)
                });
            }
        }
    });

    return Array.from(categories.values());
}

/**
 * Get category name for a menu item
 * @param {Object} item - Menu item
 * @returns {string} Category name
 */
function getItemCategoryName(item) {
    // Try to find category by ID first (API categories)
    if (Array.isArray(AppState.allCategories) && AppState.allCategories.length > 0) {
        const category = AppState.allCategories.find(cat => cat.id === item.category_id);
        if (category) return category.name;
    }

    // Fallback to old format
    if (item.category_id && item.category_id.name) {
        return item.category_id.name;
    }

    return 'Uncategorized';
}

// ============================================================================
// API DATA FETCHING
// ============================================================================

/**
 * Fetch categories from the API
 */
async function fetchCategories() {
    try {
        const response = await fetch('http://localhost:8000/api/menu/categories');
        const data = await response.json();
        console.log('Categories fetched:', data);

        if (Array.isArray(data)) {
            AppState.allCategories = data;
            renderCategoryNavbar(data);
            AppState.currentFilter = 'food';
        } else {
            console.warn('Categories API returned error:', data.message || 'Unknown error');
            AppState.allCategories = [];
            renderBasicNavbar();
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        AppState.allCategories = [];
        renderBasicNavbar();
    }
}

/**
 * Fetch menu data from the API
 */
async function fetchMenuData() {
    showLoadingState();

    try {
        const response = await fetch('http://localhost:8000/api/menu');
        // const response = await fetch('https://menu.aaentertainment.ng/api/menu');
        const data = await response.json();
        console.log('Raw menu data received:', data);

        // Debug: Log the first few items to understand the data structure
        if (Array.isArray(data) && data.length > 0) {
            console.log('Sample menu item structure:', data[0]);
            console.log('Item tags type:', typeof data[0].tags, 'Value:', data[0].tags);
        }

        AppState.rawMenuData = data;

        // If categories API failed, extract categories from menu data
        if (!Array.isArray(AppState.allCategories) || AppState.allCategories.length === 0) {
            const extractedCategories = extractCategoriesFromMenu(data);
            console.log('Extracted categories from menu data:', extractedCategories);
            AppState.allCategories = extractedCategories;
            renderCategoryNavbar(extractedCategories);
            AppState.currentFilter = 'food';

            const foodCategories = extractedCategories.filter(cat => cat.group === 'FOOD');
            renderCategoryScroll(foodCategories.map(cat => cat.name));
        }

        renderMenuByCategory();
        hideLoadingState();
    } catch (error) {
        console.error('Error fetching menu data:', error);
        showErrorState('Failed to load menu.');
        hideLoadingState();
    }
}

// ============================================================================
// MENU FILTERING
// ============================================================================

/**
 * Filter menu items based on current filter and category groups
 * @param {Array} items - Menu items to filter
 * @returns {Array} Filtered menu items
 */
function filterMenuItems(items) {
    if (AppState.currentFilter === 'all') return items;

    // If no categories available, use basic filtering
    if (!Array.isArray(AppState.allCategories) || AppState.allCategories.length === 0) {
        return items.filter(item => {
            const categoryName = getItemCategoryName(item).toLowerCase();

            if (AppState.currentFilter === 'food') {
                return CategoryPatterns.FOOD.test(categoryName);
            } else if (AppState.currentFilter === 'drinks') {
                return CategoryPatterns.DRINKS.test(categoryName);
            }

            return true;
        });
    }

    // Use category groups for filtering
    return items.filter(item => {
        const categoryName = getItemCategoryName(item);
        const category = AppState.allCategories.find(cat => cat.name === categoryName);

        if (!category) return false;
        return category.group.toLowerCase() === AppState.currentFilter;
    });
}

/**
 * Group menu items by category name
 * @param {Array} items - Menu items to group
 * @returns {Object} Grouped items by category
 */
function groupMenuByCategory(items) {
    const grouped = {};

    items.forEach(item => {
        const categoryName = getItemCategoryName(item);
        if (!grouped[categoryName]) grouped[categoryName] = [];
        grouped[categoryName].push(item);
    });

    return grouped;
}

// ============================================================================
// NAVIGATION RENDERING
// ============================================================================

/**
 * Create a navigation button element
 * @param {string} text - Button text
 * @param {string} group - Group identifier
 * @param {boolean} isActive - Whether button should be active
 * @param {Function} onClick - Click handler
 * @returns {HTMLElement} Button element
 */
function createNavButton(text, group, isActive, onClick) {
    const button = document.createElement('a');
    button.href = '#';
    button.textContent = text;
    button.className = isActive ? 'active' : '';
    button.setAttribute('data-group', group);
    button.onclick = (e) => {
        e.preventDefault();
        onClick();
    };
    return button;
}

/**
 * Render basic navbar when categories are not available
 */
function renderBasicNavbar() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    navLinks.innerHTML = '';

    AppState.categoryGroups.forEach(group => {
        const button = createNavButton(
            group,
            group,
            group === 'FOOD',
            () => setActiveFilter(group.toLowerCase())
        );
        navLinks.appendChild(button);
    });
}

/**
 * Render category navbar with groups
 * @param {Array} categories - Categories to render
 */
function renderCategoryNavbar(categories) {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    navLinks.innerHTML = '';

    // Get unique groups and sort them
    const groups = [...new Set(categories.map(cat => cat.group))];
    groups.sort((a, b) => {
        if (a === 'FOOD') return -1;
        if (b === 'FOOD') return 1;
        if (a === 'DRINKS') return -1;
        if (b === 'DRINKS') return 1;
        return a.localeCompare(b);
    });

    groups.forEach(group => {
        const button = createNavButton(
            group,
            group,
            group === 'FOOD',
            () => filterCategoriesByGroup(group)
        );
        navLinks.appendChild(button);
    });
}

/**
 * Update active state in navigation
 * @param {string} activeGroup - Group that should be active
 */
function updateNavbarActiveState(activeGroup) {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`.nav-links a[data-group="${activeGroup}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

/**
 * Filter categories by group
 * @param {string} group - Group to filter by
 */
function filterCategoriesByGroup(group) {
    updateNavbarActiveState(group);
    AppState.currentFilter = group.toLowerCase();
    renderMenuByCategory();
}

/**
 * Set active filter
 * @param {string} filter - Filter to set as active
 */
function setActiveFilter(filter) {
    AppState.currentFilter = filter;
    updateNavbarActiveState(filter.toUpperCase());
    renderMenuByCategory();
}

// ============================================================================
// MENU RENDERING
// ============================================================================

/**
 * Create category scroll buttons
 * @param {Array} categories - Categories to create buttons for
 */
function renderCategoryScroll(categories) {
    const scrollDiv = document.querySelector('.category-scroll');
    if (!scrollDiv) return;

    scrollDiv.innerHTML = '';

    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-scroll-btn';
        button.textContent = category.toUpperCase();
        button.setAttribute('data-category', category);
        button.onclick = () => {
            const sectionId = 'cat-' + category.replace(/[\s\/\(\)]/g, '-').toLowerCase();
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };
        scrollDiv.appendChild(button);
    });

    console.log(`Rendered ${categories.length} category buttons:`, categories);
}

/**
 * Create a menu item HTML element
 * @param {Object} item - Menu item data
 * @returns {string} HTML string for menu item
 */
function createMenuItemHTML(item) {
    // Debug: Log the item structure to understand the data format
    if (!item.name) {
        console.warn('Menu item missing name:', item);
    }

    const price = getItemPrice(item);

    // Safely handle tags - ensure it's an array before calling map
    let tagsHTML = '';
    if (item.tags && Array.isArray(item.tags) && item.tags.length > 0) {
        tagsHTML = `<div class="menu-item-tags">${item.tags.map(tag => `<span class='menu-item-tag'>${tag}</span>`).join('')}</div>`;
    }

    return `
        <div class="menu-item">
            <span class="item-name">${item.name || 'Unnamed Item'}</span>
            <span class="dots"></span>
            <span class="item-price">${price}</span>
        </div>
    `;
}

/**
 * Create a menu section HTML element
 * @param {string} category - Category name
 * @param {Array} items - Menu items in this category
 * @returns {string} HTML string for menu section
 */
function createMenuSectionHTML(category, items) {
    const sectionId = 'cat-' + category.replace(/[\s\/\(\)]/g, '-').toLowerCase();

    return `
        <section class="menu-section" id="${sectionId}">
            <h2 class="category-header">${category.toUpperCase()}</h2>
            <div class="menu-list">
                ${items.map(item => createMenuItemHTML(item)).join('')}
            </div>
        </section>
    `;
}

/**
 * Render menu by category
 */
function renderMenuByCategory() {
    const main = document.getElementById('menu-main');
    if (!main) return;

    main.innerHTML = '';

    if (!Array.isArray(AppState.rawMenuData) || !AppState.rawMenuData.length) return;

    // Filter and group items
    const filteredItems = filterMenuItems(AppState.rawMenuData);
    const grouped = groupMenuByCategory(filteredItems);

    // Update category scroll
    const categoryNames = Object.keys(grouped);
    renderCategoryScroll(categoryNames);

    // Render each category section
    Object.entries(grouped).forEach(([category, items]) => {
        const sectionHTML = createMenuSectionHTML(category, items);
        main.insertAdjacentHTML('beforeend', sectionHTML);

        // Debug: Verify section was created
        const sectionId = 'cat-' + category.replace(/[\s\/\(\)]/g, '-').toLowerCase();
        const section = document.getElementById(sectionId);
        if (section) {
            console.log(`Section created successfully: ${sectionId}`);
        } else {
            console.error(`Failed to create section: ${sectionId}`);
        }
    });

    // Set up scroll highlighting
    setupScrollHighlighting(grouped);
}

/**
 * Set up scroll highlighting for categories
 * @param {Object} grouped - Grouped menu items
 */
function setupScrollHighlighting(grouped) {
    // Remove existing listener to prevent duplicates
    window.removeEventListener('scroll', handleScrollHighlight);
    window.addEventListener('scroll', handleScrollHighlight);

    function handleScrollHighlight() {
        let activeCategory = null;
        const categoryNames = Object.keys(grouped);
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const triggerPoint = scrollTop + windowHeight * 0.3; // 30% from top

        console.log('Scroll position:', scrollTop, 'Trigger point:', triggerPoint);

        // Find the section that's currently in view
        for (let i = 0; i < categoryNames.length; i++) {
            const category = categoryNames[i];
            const sectionId = 'cat-' + category.replace(/[\s\/\(\)]/g, '-').toLowerCase();
            const section = document.getElementById(sectionId);

            if (section) {
                const rect = section.getBoundingClientRect();
                const sectionTop = rect.top + scrollTop;
                const sectionBottom = sectionTop + rect.height;

                console.log(`Section ${category}:`, {
                    sectionTop,
                    sectionBottom,
                    triggerPoint,
                    isInView: sectionTop <= triggerPoint && sectionBottom >= triggerPoint
                });

                // Check if this section is currently in view
                if (sectionTop <= triggerPoint && sectionBottom >= triggerPoint) {
                    activeCategory = category;
                    console.log(`Active category found: ${category}`);
                    break; // Use the first section that's in view
                }
            } else {
                console.warn(`Section not found for category: ${category} (ID: ${sectionId})`);
            }
        }

        // Update active state of category buttons
        const categoryButtons = document.querySelectorAll('.category-scroll-btn');
        console.log('Found category buttons:', categoryButtons.length);

        categoryButtons.forEach(btn => {
            const btnCategory = btn.getAttribute('data-category');
            const wasActive = btn.classList.contains('active');

            if (btnCategory === activeCategory) {
                btn.classList.add('active');
                // Temporary visual test - add a background color
                btn.style.backgroundColor = '#ff0000';
  
            } else {
                btn.classList.remove('active');
                // Remove temporary background
                btn.style.backgroundColor = '';
            }
        });

    }

    // Call once on setup to set initial active state
    setTimeout(handleScrollHighlight, 100); // Small delay to ensure DOM is ready
}

// ============================================================================
// UI STATE MANAGEMENT
// ============================================================================

/**
 * Show loading state
 */
function showLoadingState() {
    const sections = ['#specials', '#foods', '#drinks'];
    sections.forEach(selector => {
        const grid = document.querySelector(`${selector} .menu-grid`);
        if (grid) {
            grid.innerHTML = '<div class="loading">Loading menu items...</div>';
        }
    });
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    // Loading state will be replaced when renderMenu() is called
}

/**
 * Show error state
 */
function showErrorState(message = 'Unable to load menu items. Please try again later.') {
    const sections = ['#specials', '#foods', '#drinks'];
    sections.forEach(selector => {
        const grid = document.querySelector(`${selector} .menu-grid`);
        if (grid) {
            grid.innerHTML = `<div class="error">${message}</div>`;
        }
    });
}

// ============================================================================
// SERVICE SELECTION
// ============================================================================

/**
 * Handle service selection (room service vs restaurant)
 * @param {string} type - Service type ('room' or 'restaurant')
 * @param {boolean} updateURL - Whether to update the URL (default: true)
 */
function selectService(type, updateURL = true) {
    AppState.currentService = type;
    document.getElementById('serviceModal').style.display = 'none';

    // Update URL if requested
    if (updateURL) {
        updateURLWithService(type);
    }

    renderMenuByCategory();
}

/**
 * Update URL with service parameter
 * @param {string} serviceType - Service type to add to URL
 */
function updateURLWithService(serviceType) {
    const url = new URL(window.location);
    url.searchParams.set('service', serviceType);
    window.history.replaceState({}, '', url);
}

/**
 * Set service type programmatically (for external use)
 * @param {string} type - Service type ('room' or 'restaurant')
 */
function setServiceType(type) {
    if (type === 'room' || type === 'restaurant') {
        selectService(type, true);
    }
}

/**
 * Get current service type
 * @returns {string|null} Current service type or null if not set
 */
function getCurrentServiceType() {
    return AppState.currentService;
}

/**
 * Check if service type is set
 * @returns {boolean} True if service type is set
 */
function isServiceTypeSet() {
    return AppState.currentService !== null;
}

/**
 * Clear service type and show modal
 */
function clearServiceType() {
    AppState.currentService = null;
    document.getElementById('serviceModal').style.display = 'block';

    // Remove service parameter from URL
    const url = new URL(window.location);
    url.searchParams.delete('service');
    window.history.replaceState({}, '', url);

}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Initialize navigation event handlers
 */
function initializeNavigation() {
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
}

/**
 * Initialize banner image loading
 */
function initializeBannerImages() {
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
}

/**
 * Initialize service selection from URL parameters
 */
function initializeServiceSelection() {
    const serviceParam = getQueryParam('service');
    const filterParam = getQueryParam('filter');

    // Set service type from URL parameter
    if (serviceParam === 'room' || serviceParam === 'restaurant') {
        AppState.currentService = serviceParam;
        document.getElementById('serviceModal').style.display = 'none';
    } else {
        // Show modal if service type not selected
        if (!AppState.currentService) {
            document.getElementById('serviceModal').style.display = 'block';
        }
    }

    // Set filter from URL parameter
    if (filterParam && ['food', 'drinks', 'all'].includes(filterParam)) {
        AppState.currentFilter = filterParam;
    }

    // Re-render menu if service was set from URL
    if (serviceParam === 'room' || serviceParam === 'restaurant') {
        renderMenuByCategory();
    }
}

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function () {

    // Initialize UI components
    initializeNavigation();
    initializeBannerImages();
    initializeServiceSelection();

    // Fetch data
    fetchCategories();
    fetchMenuData();
});

// ============================================================================
// LEGACY FUNCTIONS (for backward compatibility)
// ============================================================================

// These functions are kept for backward compatibility but should be avoided in new code

/**
 * @deprecated Use formatPrice() instead
 */
function formatPriceWithCommas(price) {
    return formatPrice(price);
}

/**
 * @deprecated Use getItemPrice() instead
 */
function formatPriceLegacy(price) {
    return `₦${price.toLocaleString()}`;
}

/**
 * @deprecated Use the main createMenuItemHTML() function instead
 * This function is kept for backward compatibility but uses the old data structure
 */
function createLegacyMenuItemHTML(item) {
    const price = AppState.currentService === 'room' ? item.price.room : item.price.restaurant;
    const tagsHTML = item.tags ? item.tags.map(tag => `<span class="menu-item-tag">${tag}</span>`).join('') : '';

    return `
        <div class="menu-item">
            <div class="menu-item-header">
                <h3>${item.name}</h3>
                <span class="price">₦${formatPriceLegacy(price)}</span>
            </div>
            <p>${item.description}</p>
            ${tagsHTML ? `<div class="menu-item-tags">${tagsHTML}</div>` : ''}
        </div>
    `;
}
