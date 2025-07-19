# 🧠 Prompt to Build: Enriched Hotel Menu Website using HTML, CSS, and JavaScript

## 🧾 Prompt Goal:

You are a senior full stack developer. Build a dynamic and modern hotel menu website using **HTML, CSS, and JavaScript (Vanilla)**. The menu pricing should vary depending on whether the guest selects **Room Service** or **Restaurant & Bar**. Prompt the user immediately via a popup modal asking them to choose between these two options. Pricing for menu items should adjust dynamically based on the selection.

## 🌐 Project Title:

**Enriched Hotel Menu Website**

---

## 🎨 1. Elegant UI/UX Design

### 🎨 Color Palette & Branding

Use a color scheme inspired by the AA Entertainment Hotel logo (from the attached image):

* **Primary Color**: #5A5A5A (Gray tone from logo text)
* **Accent Color**: #E30613 (Red tone from the icon in the logo)
* **Background Color**: #FFFFFF (Clean white background)
* **Text Color**: #333333 (Dark gray for contrast)
* **Highlight Color**: #CCCCCC (Light gray for dividers or subtle UI elements)
* **Font**: Use a modern sans-serif font similar to the one in the logo (e.g., Poppins, Helvetica Neue, or Open Sans)

These colors and styles should reflect a premium, clean, and modern aesthetic matching the AA Entertainment Hotel Abeokuta brand.

* Recreate the layout, colors, fonts, and logo style **as shown in the attached reference image**.
* Mobile-first, fully responsive design supporting phones, tablets, smart TVs, and in-room hotel screens.
* Include smooth transitions for navigating sections.
* Include a light/dark mode toggle button.

---

## 🍽️ 2. Multi-Menu System

* Structure the menu with tabs or sections:

  * 🥘 **Restaurant Menu / Bar Menu**
  * 🍽️ **Breakfast / Lunch / Dinner**
* Allow switching between menus using tabs or navigation links.
* Include support for **event-specific menus** (e.g., "Valentine's Day Specials").

---

## 🔥 3. Advanced Menu Features

Each menu item should include:

* 📸 Dish image
* 📝 Description
* 🧪 Portion size and nutritional information
* 💵 Two price options:

  * **Room Service Price**
  * **Restaurant/Bar Price**
* 🌶️ Tags like:

  * Spicy
  * Vegetarian
  * Chef’s Special
  * New
  * Popular
* 🍽️ Dietary filters:

  * Vegan
  * Gluten-free
  * Halal
  * Contains Allergens

---

## 📱 4. Smart QR Code Integration

# * Generate QR codes linking to specific menus.
# * QR codes should include branding elements (logo, color).
# * If the browser doesn't support QR, offer **PDF download** of the menu as fallback.

---

## 🔍 5. Search & Filters

* Live search bar with instant filtering (e.g., typing “Chicken” should show related dishes).
* Filters for:

  * Meal Type (Breakfast, Lunch, etc.)
  * Price Range
  * Food Category (e.g., Main Course, Dessert)
  * Special Offers (e.g., Happy Hour)

---

## 🛠️ 6. Role-Based Popup Modal

* When the site loads, prompt the user with:

  > “Please select your service type: Room Service or Restaurant & Bar”
* Based on the selection, adjust pricing for all visible menu items accordingly.
* Save user selection in `localStorage` to persist on refresh.

---

## 🧑‍💼 7. Admin Dashboard

* Backend server (Node.js + Express) connects to MongoDB.
* Admin actions (Add/Edit/Delete menu items) update MongoDB records.
* All menu items are fetched from MongoDB using an API like:

  * `GET /api/menu` – Returns all menu items
  * `POST /api/menu` – Adds a new item
  * `PUT /api/menu/:id` – Updates a menu item
  * `DELETE /api/menu/:id` – Removes an item
* Menu data is returned in JSON and consumed via `fetch()` on the frontend.
* Basic admin interface (can be a separate HTML page):

  * Secure login (dummy credentials for now).
  * Add/Edit/Remove menu items.
  * Upload dish photos.
  * Specify Room Service vs. Restaurant pricing.
  * Option to preview changes live.

---

## 📦 Tech Stack & Tools

* HTML5
* CSS3 (Flexbox/Grid, transitions, variables)
* JavaScript (ES6+)
* Node.js + Express for backend server
* MongoDB (Atlas or local instance)
* \[Optional] TailwindCSS or Bootstrap for faster UI scaffolding
* QR Code Library (e.g., `qrcode.js` or `QRCodeStyling`)
* \[Optional] JSON file for loading menu items dynamically (for fallback or testing)

---

## 📁 Folder Structure Example

```plaintext
hotel-menu-site/
│
├── index.html
├── menu.html
├── admin.html
│
├── css/
│   └── styles.css
│
├── js/
│   ├── main.js
│   ├── menu.js
│   └── admin.js
│
├── data/
│   └── menu.json
│
├── images/
│   └── dishes/
│
├── assets/
│   └── fonts/
│
└── README.md

backend/
├── server.js
├── routes/
│   └── menu.js
├── models/
│   └── MenuItem.js
├── controllers/
│   └── menuController.js
├── .env
└── package.json
```

---

## ⚙️ MongoDB Setup Notes

1. Create a **MongoDB Atlas** account or run MongoDB locally.

2. Use a `.env` file to store the connection string securely.

3. Example `.env`:

   ```env
   MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/menuDB?retryWrites=true&w=majority
   ```

4. Example Express connection (`server.js`):

   ```js
   const express = require('express');
   const mongoose = require('mongoose');
   const menuRoutes = require('./routes/menu');
   require('dotenv').config();

   const app = express();
   app.use(express.json());

   mongoose.connect(process.env.MONGO_URI)
     .then(() => console.log('MongoDB connected'))
     .catch(err => console.log(err));

   app.use('/api/menu', menuRoutes);

   app.listen(5000, () => console.log('Server running on port 5000'));
   ```
