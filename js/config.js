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

    OWNER_NAME: 'CA Tanmay Rajendra Bhavar',
    OWNER_EMAIL: 'catanmaybhavar@gmail.com',
    OWNER_PHONE: '8329213804, 9168026111',
    OWNER_LINKEDIN: 'https://www.linkedin.com/in/tbhavar/',
    OWNER_WEBSITE: 'tbhavar.in',
    OWNER_TITLE: 'Chartered Accountant | GST & Tax Consultant',
    OWNER_VCF_URL: 'https://cardscanner.tbhavar.in/assets/contacts.vcf',
    OWNER_PHOTO_URL: 'https://raw.githubusercontent.com/tbhavar/Visiting_Card_Scanner/main/profile.jpg',

    GOOGLE_SHEETS_URL: '__GOOGLE_SHEETS_URL__'
};
