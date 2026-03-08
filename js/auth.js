// ============================================================
// auth.js — Password gate using SHA-256 hash comparison
// ============================================================

const Auth = (() => {
    const SESSION_KEY = 'vcscanner_authenticated';

    async function sha256(message) {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function isAuthenticated() {
        return sessionStorage.getItem(SESSION_KEY) === 'true';
    }

    async function login(password) {
        const hash = await sha256(password);
        if (hash === APP_CONFIG.AUTH_HASH) {
            sessionStorage.setItem(SESSION_KEY, 'true');
            return true;
        }
        return false;
    }

    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
    }

    return { isAuthenticated, login, logout };
})();
