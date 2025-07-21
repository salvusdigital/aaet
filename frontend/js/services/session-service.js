import config from '../config/config.js';

class SessionService {
    constructor(sessionKey) {
        this.sessionKey = `${config.session.storagePrefix}${sessionKey}`;
        this.setupActivityListeners();
        this.checkInterval = null;
    }

    setupActivityListeners() {
        ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(eventType => {
            document.addEventListener(eventType, () => this.updateTimestamp());
        });
    }

    startExpiryCheck(onExpire) {
        this.checkInterval = setInterval(() => {
            if (this.hasExpired()) {
                this.clear();
                if (onExpire) onExpire();
                if (config.features.enableAnalytics) {
                    this.logSessionExpiry();
                }
            }
        }, 60000); // Check every minute
    }

    stopExpiryCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    get() {
        try {
            const data = JSON.parse(sessionStorage.getItem(this.sessionKey) || '{}');
            if (this.hasExpired()) {
                this.clear();
                return null;
            }
            return data.value;
        } catch (e) {
            if (config.features.debugMode) {
                console.error('Session read error:', e);
            }
            this.clear();
            return null;
        }
    }

    set(value) {
        try {
            const data = {
                value,
                timestamp: Date.now()
            };
            sessionStorage.setItem(this.sessionKey, JSON.stringify(data));
            this.updateTimestamp();
        } catch (e) {
            if (config.features.debugMode) {
                console.error('Session write error:', e);
            }
            // Attempt to clear space in sessionStorage
            this.clearOldSessions();
        }
    }

    updateTimestamp() {
        try {
            const data = JSON.parse(sessionStorage.getItem(this.sessionKey) || '{}');
            if (data.value) {
                data.timestamp = Date.now();
                sessionStorage.setItem(this.sessionKey, JSON.stringify(data));
            }
        } catch (e) {
            if (config.features.debugMode) {
                console.error('Timestamp update error:', e);
            }
        }
    }

    hasExpired() {
        try {
            const data = JSON.parse(sessionStorage.getItem(this.sessionKey) || '{}');
            if (!data.timestamp) return true;
            return (Date.now() - data.timestamp) > (config.session.timeoutMinutes * 60 * 1000);
        } catch (e) {
            if (config.features.debugMode) {
                console.error('Expiry check error:', e);
            }
            return true;
        }
    }

    clear() {
        try {
            sessionStorage.removeItem(this.sessionKey);
        } catch (e) {
            if (config.features.debugMode) {
                console.error('Session clear error:', e);
            }
        }
    }

    // Production helper methods
    clearOldSessions() {
        try {
            const prefix = config.session.storagePrefix;
            Object.keys(sessionStorage)
                .filter(key => key.startsWith(prefix))
                .forEach(key => {
                    try {
                        const data = JSON.parse(sessionStorage.getItem(key) || '{}');
                        if (this.isExpired(data.timestamp)) {
                            sessionStorage.removeItem(key);
                        }
                    } catch (e) {
                        sessionStorage.removeItem(key);
                    }
                });
        } catch (e) {
            if (config.features.debugMode) {
                console.error('Clear old sessions error:', e);
            }
        }
    }

    isExpired(timestamp) {
        if (!timestamp) return true;
        return (Date.now() - timestamp) > (config.session.timeoutMinutes * 60 * 1000);
    }

    logSessionExpiry() {
        // Implement your analytics logging here
        // Example:
        if (typeof window.gtag === 'function') {
            window.gtag('event', 'session_expired', {
                'event_category': 'Session',
                'event_label': this.sessionKey
            });
        }
    }
}

export default SessionService; 