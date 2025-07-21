// Environment detection
const isProd = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
const isDev = !isProd;

// Configuration object
const config = {
    // API URLs
    api: {
        baseUrl: isProd
            ? 'https://api.aaentertainment.com/api'  // Replace with your actual production API domain
            : 'http://localhost:8000/api',
        timeout: 30000, // 30 seconds
    },

    // Session configuration
    session: {
        timeoutMinutes: 30,
        storagePrefix: isProd ? 'aaet_prod_' : 'aaet_dev_',
        secure: isProd,
    },

    // Feature flags
    features: {
        enableAnalytics: isProd,
        debugMode: isDev,
    },

    // Security settings
    security: {
        requireHttps: isProd,
        csrfEnabled: true,
        corsAllowedOrigins: isProd
            ? ['https://aaentertainment.com', 'https://admin.aaentertainment.com']
            : ['http://localhost:8000', 'http://127.0.0.1:8000'],
    }
};

// Enforce HTTPS in production
if (config.security.requireHttps && window.location.protocol === 'http:' && isProd) {
    window.location.href = window.location.href.replace('http:', 'https:');
}

export default config; 