// ============================================================
// config.js — Build-time configuration (injected by GitHub Actions)
// Placeholders are replaced with GitHub Secrets during deployment.
// For local development, replace __PLACEHOLDERS__ manually.
// ============================================================

const APP_CONFIG = {
    AUTH_HASH: '__AUTH_HASH__',
    GEMINI_API_KEY: '__GEMINI_API_KEY__',

    EMAILJS_PUBLIC_KEY: '__EMAILJS_PUBLIC_KEY__',
    EMAILJS_SERVICE_ID: '__EMAILJS_SERVICE_ID__',
    EMAILJS_TEMPLATE_ID: '__EMAILJS_TEMPLATE_ID__',

    OWNER_NAME: '__OWNER_NAME__',
    OWNER_EMAIL: '__OWNER_EMAIL__',
    OWNER_PHONE: '__OWNER_PHONE__',
    OWNER_LINKEDIN: '__OWNER_LINKEDIN__'
};
