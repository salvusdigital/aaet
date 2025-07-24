# AA Entertainment Hotel - Admin Panel

This folder contains the admin panel for the AA Entertainment Hotel website.

## File Structure

```
admin/
├── index.html          # Main entry point (redirects to login/dashboard)
├── login.html          # Admin login page
├── dashboard.html      # Main dashboard with menu items management
├── categories.html     # Categories management page
├── settings.html       # System settings page
├── js/
│   ├── login.js        # Login functionality
│   ├── dashboard.js    # Dashboard and menu items functionality
│   ├── categories.js   # Categories management functionality
│   └── settings.js     # Settings management functionality
└── README.md           # This file
```

## Pages Overview

### 1. Login Page (`login.html`)
- Clean login form with username and password
- Authentication check and redirect logic
- Error handling for invalid credentials

### 2. Dashboard (`dashboard.html`)
- Menu items management (CRUD operations)
- Search and filter functionality
- Add/Edit item modal with form validation
- Image upload support
- Category filtering

### 3. Categories (`categories.html`)
- Category management (CRUD operations)
- Visual category cards with icons and colors
- Status management (active/inactive)
- Search and filter by status

### 4. Settings (`settings.html`)
- Hotel information management
- System settings (currency, timezone, language)
- Admin account password change
- Backup and restore functionality
- Maintenance mode toggle

## Features

### Authentication
- JWT token-based authentication
- Automatic redirect to login if not authenticated
- Logout functionality

### Navigation
- Consistent sidebar navigation across all pages
- Active page highlighting
- Smooth page transitions

### UI/UX
- Responsive design
- Modern card-based layout
- Toast notifications for success/error messages
- Modal dialogs for forms
- Loading states and error handling

### Data Management
- Real-time search and filtering
- Form validation
- File upload support
- Bulk operations support

## API Integration

All pages integrate with the backend API at `http://localhost:8000/api`:

- **Authentication**: `/admin/login`
- **Menu Items**: `/admin/menu`
- **Categories**: `/admin/categories`
- **Settings**: `/admin/settings`
- **Profile**: `/admin/profile`
- **Backup**: `/admin/backup`, `/admin/restore`

## Styling

The admin panel uses the existing `../css/admin.css` file with additional styles for:
- Settings grid layout
- Category cards
- Status badges
- Notification animations
- Form enhancements

## Usage

1. Access the admin panel at `/admin/`
2. Login with admin credentials
3. Navigate between different sections using the sidebar
4. Manage menu items, categories, and system settings
5. Use search and filter functions to find specific items
6. Create backups and restore data as needed

## Security

- All API calls require authentication tokens
- Automatic logout on token expiration
- Form validation on both client and server side
- Secure file upload handling
- Password change functionality with current password verification 