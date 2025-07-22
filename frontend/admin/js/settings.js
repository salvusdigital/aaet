// API Configuration
const API_URL = 'https://aaet.onrender.com/api';
let token = localStorage.getItem('adminToken');

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const navLinks = document.querySelectorAll('.nav-links li');
const hotelInfoForm = document.getElementById('hotelInfoForm');
const systemSettingsForm = document.getElementById('systemSettingsForm');
const adminAccountForm = document.getElementById('adminAccountForm');
const backupBtn = document.getElementById('backupBtn');
const restoreBtn = document.getElementById('restoreBtn');
const restoreFile = document.getElementById('restoreFile');

// Check Authentication
function checkAuth() {
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    loadSettings();
    loadAdminInfo();
}

// Navigation
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const section = e.currentTarget.dataset.section;
            if (section) {
                navigateToSection(section);
            }
        });
    });
}

function navigateToSection(section) {
    switch(section) {
        case 'menu-items':
            window.location.href = 'dashboard.html';
            break;
        case 'categories':
            window.location.href = 'categories.html';
            break;
        case 'settings':
            // Already on settings page
            break;
    }
}

// API Calls
async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/admin/settings`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const settings = await response.json();
            populateSettings(settings);
        }
    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

async function loadAdminInfo() {
    try {
        const response = await fetch(`${API_URL}/admin/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const admin = await response.json();
            document.getElementById('adminUsername').value = admin.username;
        }
    } catch (error) {
        console.error('Failed to load admin info:', error);
    }
}

async function saveHotelInfo(formData) {
    try {
        const response = await fetch(`${API_URL}/admin/settings/hotel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });

        if (!response.ok) {
            throw new Error('Failed to save hotel information');
        }

        showSuccess('Hotel information saved successfully!');
    } catch (error) {
        showError(error.message);
    }
}

async function saveSystemSettings(formData) {
    try {
        const response = await fetch(`${API_URL}/admin/settings/system`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });

        if (!response.ok) {
            throw new Error('Failed to save system settings');
        }

        showSuccess('System settings saved successfully!');
    } catch (error) {
        showError(error.message);
    }
}

async function changePassword(formData) {
    try {
        const data = Object.fromEntries(formData);
        
        if (data.newPassword !== data.confirmPassword) {
            throw new Error('New passwords do not match');
        }

        const response = await fetch(`${API_URL}/admin/change-password`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            })
        });

        if (!response.ok) {
            throw new Error('Failed to change password');
        }

        showSuccess('Password changed successfully!');
        adminAccountForm.reset();
    } catch (error) {
        showError(error.message);
    }
}

async function createBackup() {
    try {
        const response = await fetch(`${API_URL}/admin/backup`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to create backup');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showSuccess('Backup created successfully!');
        updateBackupInfo();
    } catch (error) {
        showError(error.message);
    }
}

async function restoreBackup(file) {
    try {
        const formData = new FormData();
        formData.append('backup', file);

        const response = await fetch(`${API_URL}/admin/restore`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to restore backup');
        }

        showSuccess('Backup restored successfully!');
    } catch (error) {
        showError(error.message);
    }
}

// UI Functions
function populateSettings(settings) {
    // Populate hotel information
    if (settings.hotel) {
        document.getElementById('hotelName').value = settings.hotel.name || '';
        document.getElementById('hotelAddress').value = settings.hotel.address || '';
        document.getElementById('hotelPhone').value = settings.hotel.phone || '';
        document.getElementById('hotelEmail').value = settings.hotel.email || '';
    }

    // Populate system settings
    if (settings.system) {
        document.getElementById('currency').value = settings.system.currency || 'USD';
        document.getElementById('timezone').value = settings.system.timezone || 'UTC';
        document.getElementById('language').value = settings.system.language || 'en';
        document.getElementById('maintenanceMode').checked = settings.system.maintenanceMode || false;
    }
}

function updateBackupInfo() {
    // This would typically fetch backup info from the server
    document.getElementById('lastBackup').textContent = new Date().toLocaleString();
    document.getElementById('backupSize').textContent = '2.5 MB'; // Example size
}

function logout() {
    localStorage.removeItem('adminToken');
    token = null;
    window.location.href = 'login.html';
}

function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #dc3545;
        color: white;
        padding: 1rem;
        border-radius: 4px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #28a745;
        color: white;
        padding: 1rem;
        border-radius: 4px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Event Listeners
hotelInfoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    saveHotelInfo(formData);
});

systemSettingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    saveSystemSettings(formData);
});

adminAccountForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    changePassword(formData);
});

backupBtn.addEventListener('click', createBackup);

restoreBtn.addEventListener('click', () => {
    restoreFile.click();
});

restoreFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        if (confirm('Are you sure you want to restore from this backup? This will overwrite current data.')) {
            restoreBackup(file);
        }
        e.target.value = ''; // Reset file input
    }
});

logoutBtn.addEventListener('click', logout);

// Initialize
checkAuth();
setupNavigation();
updateBackupInfo(); 