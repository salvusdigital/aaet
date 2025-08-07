// API Configuration
// const API_URL = 'https://aaet.onrender.com/api';
const API_URL = 'https://menu.aaentertainment.ng/api';

// DOM Elements
const loginForm = document.getElementById('login-form');

// Check if user is already logged in
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (token) {
        // Redirect to dashboard if already logged in
        window.location.href = 'dashboard.html';
    }
}

// Login function
async function login(username, password) {
    try {
        const response = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            let errorMsg = 'Invalid credentials';
            try {
                const errorData = await response.json();
                if (errorData && errorData.message) {
                    errorMsg = errorData.message;
                }
            } catch (e) {
                // Ignore JSON parse errors
            }
            throw new Error(errorMsg);
        }

        const data = await response.json();
        console.log(data);
        localStorage.setItem('adminToken', data.token);
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } catch (error) {
        showError(error.message);
    }
}

// Show error message
function showError(message) {
    // Remove existing error message
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        color: #dc3545;
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        padding: 0.75rem;
        margin-bottom: 1rem;
        text-align: center;
    `;
    errorDiv.textContent = message;

    // Insert error message before the form
    loginForm.parentNode.insertBefore(errorDiv, loginForm);
}

// Event Listeners
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    login(username, password);
});

// Initialize
checkAuth(); 