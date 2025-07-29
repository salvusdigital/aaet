import SessionService from './services/session-service.js';

const serviceTypeSession = new SessionService('serviceType');
const BASE_URL = 'https://aaet.onrender.com/api/menu';

// Store raw menu data globally
let menuDataRaw = [];

// Service type handling
let currentService = null; // Always start with null to show modal

// Helper: Get query parameter from URL
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function selectService(type) {
    currentService = type;
    localStorage.setItem('serviceType', type);
    serviceTypeSession.set(type);
    document.getElementById('serviceModal').style.display = 'none';
    renderMenu();
}
window.selectService = selectService;

// Fetch menu data from API
async function fetchMenuData() {
    try {
        // showLoadingState();
        const response = await fetch(BASE_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Raw menu data received:', data);
        menuDataRaw = data;
        // hideLoadingState();
        return data; // Return data for rendering
    } catch (error) {
        console.error('Error fetching menu data:', error);
        // hideLoadingState();
        showErrorState();
        menuDataRaw = [];
        return []; // Return empty array on error
    }
}

// Fetch categories from API and return as array
async function fetchCategories() {
    try {
        const response = await fetch('https://aaet.onrender.com/api/menu/categories');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const categories = await response.json();
        console.log('Categories:', categories);
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

// Function to handle section toggling
function toggleSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }

    // Update navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

async function renderMenu() {
    // Get the food and drinks section containers
    const foodsContainer = document.querySelector('#foods');
    const drinksContainer = document.querySelector('#drinks');

    // Clear existing content
    foodsContainer.innerHTML = '<div class="menu-sections-grid"></div>';
    drinksContainer.innerHTML = '<div class="menu-sections-grid"></div>';

    // Get the grid containers
    const foodsGrid = foodsContainer.querySelector('.menu-sections-grid');
    const drinksGrid = drinksContainer.querySelector('.menu-sections-grid');

    // Fetch menu data and categories
    const menuData = await fetchMenuData();
    const categories = await fetchCategories();

    // Group menu items by category
    const menuSections = categories.reduce((acc, category) => {
        const categoryItems = menuData.filter(item =>
            item.category_id && item.category_id._id === category._id
        );

        if (categoryItems.length > 0) {
            acc[category._id] = {
                name: category.name.toUpperCase(),
                group: category.group,
                items: categoryItems.map(item => ({
                    name: item.name.toUpperCase(),
                    price: typeof item.price_restaurant === 'number' && currentService === 'restaurant'
                        ? `N${item.price_restaurant.toLocaleString()}`
                        : (typeof item.price_room === 'number' && currentService === 'room'
                            ? `N${item.price_room.toLocaleString()}`
                            : '')
                }))
            };
        }

        return acc;
    }, {});

    // Create sections for each category based on their group
    Object.values(menuSections).forEach(({ name, group, items }) => {
        const sectionBanner = document.createElement('section');
        sectionBanner.className = 'section-banner active'; // Add 'active' class for default open state

        sectionBanner.innerHTML = `
            <h2>${name}</h2>
            <div class="menu-grid">
                ${items.map(item => `
                    <div class="menu-item">
                        <span class="menu-item-name">${item.name}</span>
                        <span class="menu-item-price">${item.price}</span>
                    </div>
                `).join('')}
            </div>
        `;

        // Add to the appropriate container based on group
        if (group === 'Drinks') {
            drinksGrid.appendChild(sectionBanner);
        } else {
            foodsGrid.appendChild(sectionBanner);
        }
    });

    // Add click handlers for accordion functionality
    const sections = document.querySelectorAll('.section-banner');
    sections.forEach(section => {
        const header = section.querySelector('h2');
        header.addEventListener('click', () => {
            section.classList.toggle('active');
        });
    });

    // Show initial active section (foods)
    toggleSection('foods');
}

// Function to handle mobile menu toggle
function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');

    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('show');
        const isExpanded = mobileMenu.classList.contains('show');
        menuToggle.setAttribute('aria-expanded', isExpanded);

        // Update toggle button icon
        const toggleIcon = menuToggle.querySelector('span');
        toggleIcon.textContent = isExpanded ? '×' : '☰';
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.menu-toggle') &&
            !e.target.closest('.mobile-menu') &&
            mobileMenu.classList.contains('show')) {
            mobileMenu.classList.remove('show');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.querySelector('span').textContent = '☰';
        }
    });

    // Close mobile menu when clicking a link
    mobileMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('show');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.querySelector('span').textContent = '☰';
        });
    });
}

// Call renderMenu when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Service type modal logic
    const serviceParam = getQueryParam('service');
    let storedService = localStorage.getItem('serviceType') || serviceTypeSession.get();
    if (serviceParam === 'room' || serviceParam === 'restaurant') {
        currentService = serviceParam;
        serviceTypeSession.set(serviceParam);
        document.getElementById('serviceModal').style.display = 'none';
        renderMenu();
    } else if (storedService === 'room' || storedService === 'restaurant') {
        currentService = storedService;
        document.getElementById('serviceModal').style.display = 'none';
        renderMenu();
    } else {
        document.getElementById('serviceModal').style.display = 'flex';
    }
    // Modal button handlers
    const roomBtn = document.getElementById('roomServiceBtn');
    const restBtn = document.getElementById('restaurantBtn');
    if (roomBtn && restBtn) {
        roomBtn.onclick = () => selectService('room');
        restBtn.onclick = () => selectService('restaurant');
    }
    renderMenu();
    setupMobileMenu();

    // Add click handlers for navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            toggleSection(sectionId);

            // Update URL hash without scrolling
            history.pushState(null, '', link.getAttribute('href'));

            // Change background image based on section
            const body = document.body;
            if (sectionId === 'foods') {
                body.style.backgroundImage = "url('images/bgs.jpg')";
            } else if (sectionId === 'drinks') {
                body.style.backgroundImage = "url('images/drinks5.jpg')";
            }
        });
    });

    // Handle initial hash in URL
    const hash = window.location.hash.slice(1);
    if (hash === 'drinks' || hash === 'foods') {
        toggleSection(hash);
    }
});

// Price format helper
function formatPrice(price) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}


// Update all price displays
document.querySelectorAll('.price').forEach(priceElement => {
    const price = parseFloat(priceElement.dataset.price);
    if (!isNaN(price)) {
        priceElement.textContent = formatPrice(price);
    }
});


// Show error state
function showErrorState() {
    const sections = ['#menu-container'];
    sections.forEach(selector => {
        const grid = document.querySelector(`${selector} .menu-grid`);
        if (grid) {
            grid.innerHTML = '<div class="error">Unable to load menu items. Please try again later.</div>';
        }
    });
}
