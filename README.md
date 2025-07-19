# Enriched Hotel Menu Website

This is a dynamic and modern hotel menu website built using HTML, CSS, and JavaScript (Vanilla). The menu pricing varies depending on whether the guest selects **Room Service** or **Restaurant & Bar**. The user is prompted immediately via a popup modal asking them to choose between these two options. The pricing for menu items adjusts dynamically based on the selection.

## Features

* **Multi-Menu System**: Structure the menu with tabs or sections: Restaurant Menu / Bar Menu, Breakfast / Lunch / Dinner, and event-specific menus (e.g., "Valentine's Day Specials")
* **Advanced Menu Features**: Each menu item includes dish image, description, portion size and nutritional information, two price options (Room Service Price and Restaurant/Bar Price), and tags like Spicy, Vegetarian, Chef's Special, New, Popular
* **Smart QR Code Integration**: Generate QR codes linking to specific menus, with branding elements (logo, color), and a PDF download of the menu as fallback
* **Role-Based Popup Modal**: Prompt the user to select their service type (Room Service or Restaurant & Bar) and adjust pricing for all visible menu items accordingly
* **Admin Dashboard**: A backend server (Node.js + Express) connects to MongoDB, allowing admin actions (Add/Edit/Delete menu items) to update MongoDB records, and a basic admin interface (can be a separate HTML page) for secure login, adding/editing/removing menu items, uploading dish photos, specifying Room Service vs. Restaurant pricing, and previewing changes live

## Tech Stack & Tools

* HTML5
* CSS3 (Flexbox/Grid, transitions, variables)
* JavaScript (ES6+)
* Node.js + Express for backend server
* MongoDB (Atlas or local instance)
* JSON file for loading menu items dynamically (for fallback or testing)
* QR Code Library (e.g., `qrcode.js` or `QRCodeStyling`)
* Light/dark mode toggle button

## Folder Structure Example
