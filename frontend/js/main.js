// Sample menu data - In a real application, this would come from a backend API
const menuData = {
    specials: [
        {
            id: 1,
            name: "Jollof Rice Special",
            description: "Nigerian-style jollof rice cooked with tomatoes, peppers, and aromatic spices, served with grilled chicken and plantains.",
            image: "https://img.freepik.com/free-photo/jollof-rice-with-grilled-chicken-plantains_23-2148715455.jpg",
            price: {
                room: 13500,
                restaurant: 11500
            },
            tags: ["Popular", "Chef's Special"]
        },
        {
            id: 2,
            name: "Suya Platter",
            description: "Traditional Nigerian spiced grilled beef skewers served with onions, tomatoes, and special suya spice.",
            image: "https://img.freepik.com/free-photo/grilled-meat-skewers-with-spices_23-2148715458.jpg",
            price: {
                room: 15500,
                restaurant: 13500
            },
            tags: ["Spicy", "Popular"]
        },
        {
            id: 3,
            name: "Seafood Okra Soup",
            description: "Fresh okra soup prepared with assorted seafood, served with pounded yam or eba.",
            image: "https://img.freepik.com/free-photo/african-food-okra-soup_23-2148715460.jpg",
            price: {
                room: 14500,
                restaurant: 12500
            },
            tags: ["New", "Chef's Special"]
        },
        {
            id: 4,
            name: "Egusi Soup Special",
            description: "Rich melon seed soup with assorted meat and fish, served with any swallow of your choice.",
            image: "https://img.freepik.com/free-photo/egusi-soup-with-pounded-yam_23-2148715463.jpg",
            price: {
                room: 13000,
                restaurant: 11000
            },
            tags: ["Popular"]
        },
        {
            id: 5,
            name: "Grilled Fish Platter",
            description: "Whole grilled tilapia seasoned with herbs and spices, served with pepper sauce and sides.",
            image: "https://img.freepik.com/free-photo/grilled-fish-with-pepper-sauce_23-2148715466.jpg",
            price: {
                room: 16500,
                restaurant: 14500
            },
            tags: ["Chef's Special"]
        }
    ],
    foods: [
        {
            id: 6,
            name: "Chicken Pepper Soup",
            description: "Spicy Nigerian pepper soup with tender chicken pieces and aromatic spices.",
            image: "https://img.freepik.com/free-photo/spicy-pepper-soup_23-2148715469.jpg",
            price: {
                room: 12000,
                restaurant: 10000
            },
            tags: ["Spicy"]
        },
        {
            id: 7,
            name: "Vegetable Rice Bowl",
            description: "Steamed rice served with sautéed vegetables and choice of protein.",
            image: "https://img.freepik.com/free-photo/vegetable-rice-bowl_23-2148715472.jpg",
            price: {
                room: 11000,
                restaurant: 9000
            },
            tags: ["Vegetarian"]
        },
        {
            id: 8,
            name: "Moi Moi Deluxe",
            description: "Steamed bean pudding with eggs, fish, and vegetables.",
            image: "https://img.freepik.com/free-photo/moi-moi-with-eggs_23-2148715475.jpg",
            price: {
                room: 8500,
                restaurant: 7000
            },
            tags: ["Vegetarian"]
        },
        {
            id: 9,
            name: "Asun (Spicy Goat Meat)",
            description: "Peppered goat meat with onions and bell peppers.",
            image: "https://img.freepik.com/free-photo/spicy-goat-meat_23-2148715478.jpg",
            price: {
                room: 14000,
                restaurant: 12000
            },
            tags: ["Spicy", "Popular"]
        },
        {
            id: 10,
            name: "Coconut Rice Special",
            description: "Fragrant coconut rice served with grilled chicken and coleslaw.",
            image: "https://img.freepik.com/free-photo/coconut-rice-with-chicken_23-2148715481.jpg",
            price: {
                room: 12500,
                restaurant: 10500
            },
            tags: ["New"]
        }
    ],
    drinks: [
        {
            id: 11,
            name: "Chapman Cocktail",
            description: "Refreshing Nigerian cocktail made with Fanta, Sprite, and other ingredients.",
            image: "https://img.freepik.com/free-photo/chapman-cocktail_23-2148715484.jpg",
            price: {
                room: 5500,
                restaurant: 4500
            },
            tags: ["Popular"]
        },
        {
            id: 12,
            name: "Zobo (Hibiscus) Drink",
            description: "Traditional Nigerian drink made from hibiscus flowers.",
            image: "https://img.freepik.com/free-photo/zobo-drink_23-2148715487.jpg",
            price: {
                room: 4000,
                restaurant: 3000
            },
            tags: ["New"]
        },
        {
            id: 13,
            name: "Fresh Fruit Smoothie",
            description: "Blend of seasonal tropical fruits with yogurt.",
            image: "https://img.freepik.com/free-photo/fresh-fruit-smoothie_23-2148715490.jpg",
            price: {
                room: 6000,
                restaurant: 5000
            },
            tags: ["Vegetarian"]
        },
        {
            id: 14,
            name: "Palm Wine Special",
            description: "Fresh palm wine served in traditional style.",
            image: "https://img.freepik.com/free-photo/palm-wine_23-2148715493.jpg",
            price: {
                room: 7000,
                restaurant: 6000
            },
            tags: ["Chef's Special"]
        },
        {
            id: 15,
            name: "Tropical Punch",
            description: "Mix of tropical fruit juices with a hint of mint.",
            image: "https://img.freepik.com/free-photo/tropical-punch_23-2148715496.jpg",
            price: {
                room: 5000,
                restaurant: 4000
            },
            tags: ["New"]
        }
    ]
};

// Service type handling
let currentService = localStorage.getItem('serviceType') || null;

// Show modal if service type not selected
if (!currentService) {
    document.getElementById('serviceModal').style.display = 'block';
}

// Service selection handler
function selectService(type) {
    currentService = type;
    localStorage.setItem('serviceType', type);
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
    const item = allItems.find(item => item.id === itemId);
    
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
    specialsGrid.innerHTML = menuData.specials.map(item => createMenuItemHTML(item)).join('');

    // Render foods
    const foodsGrid = document.querySelector('#foods .menu-grid');
    foodsGrid.innerHTML = menuData.foods.map(item => createMenuItemHTML(item)).join('');

    // Render drinks
    const drinksGrid = document.querySelector('#drinks .menu-grid');
    drinksGrid.innerHTML = menuData.drinks.map(item => createMenuItemHTML(item)).join('');
}

// Initial render
if (currentService) {
    renderMenu();
}

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

// Add loading state for section banner images
document.addEventListener('DOMContentLoaded', function() {
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
}); 