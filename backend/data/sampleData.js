const categories = [
    {
        name: "specials",
        description: "Chef's special dishes and featured items",
        isActive: true,
        sortOrder: 1
    },
    {
        name: "foods",
        description: "Main course dishes and entrees",
        isActive: true,
        sortOrder: 2
    },
    {
        name: "drinks",
        description: "Beverages, cocktails, and refreshments",
        isActive: true,
        sortOrder: 3
    },
    {
        name: "appetizers",
        description: "Starters and small plates",
        isActive: true,
        sortOrder: 4
    },
    {
        name: "desserts",
        description: "Sweet treats and desserts",
        isActive: true,
        sortOrder: 5
    }
];

const menuItems = [
    {
        name: "Classic Beef Burger",
        description: "Juicy beef patty with fresh lettuce, tomatoes, onions, and our special sauce, served with crispy fries.",
        price: {
            room: 8500,
            restaurant: 7500
        },
        category: "specials",
        tags: ["Popular", "Chef's Special"],
        image: "/images/heading-burger.jpg",
        isActive: true
    },
    {
        name: "Grilled Chicken Salad",
        description: "Fresh mixed greens topped with grilled chicken breast, cherry tomatoes, cucumber, and balsamic dressing.",
        price: {
            room: 6500,
            restaurant: 5500
        },
        category: "foods",
        tags: ["Healthy", "Popular"],
        image: "/images/header-1583x1080.jpg",
        isActive: true
    },
    {
        name: "Fish and Chips",
        description: "Crispy battered fish fillet served with golden fries, tartar sauce, and a lemon wedge.",
        price: {
            room: 9500,
            restaurant: 8500
        },
        category: "specials",
        tags: ["Popular"],
        image: "/images/Menu.png",
        isActive: true
    },
    {
        name: "Signature Club Sandwich",
        description: "Triple-decker sandwich with grilled chicken, bacon, lettuce, tomato, and mayo, served with fries.",
        price: {
            room: 7500,
            restaurant: 6500
        },
        category: "foods",
        tags: ["Classic"],
        image: "/images/heading-burger.jpg",
        isActive: true
    },
    {
        name: "Fresh Fruit Smoothie",
        description: "Blend of seasonal fruits with yogurt and honey. Choice of: Strawberry-Banana, Mango-Passion, or Mixed Berry.",
        price: {
            room: 3500,
            restaurant: 3000
        },
        category: "drinks",
        tags: ["Healthy", "Popular"],
        image: "/images/header-1583x1080.jpg",
        isActive: true
    },
    {
        name: "Chocolate Brownie Sundae",
        description: "Warm chocolate brownie topped with vanilla ice cream, chocolate sauce, and whipped cream.",
        price: {
            room: 4500,
            restaurant: 4000
        },
        category: "specials",
        tags: ["Dessert", "Popular"],
        image: "/images/Menu.png",
        isActive: true
    }
];

module.exports = { menuItems, categories }; 