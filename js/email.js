// ============================================================
// email.js — EmailJS integration for sending introduction emails
// ============================================================

const EmailService = (() => {
    let initialized = false;

    function init() {
        if (initialized) return;
        if (typeof emailjs !== 'undefined' && APP_CONFIG.EMAILJS_PUBLIC_KEY && APP_CONFIG.EMAILJS_PUBLIC_KEY !== '__EMAILJS_PUBLIC_KEY__') {
            emailjs.init(APP_CONFIG.EMAILJS_PUBLIC_KEY);
            initialized = true;
        }
    }

    function isConfigured() {
        return APP_CONFIG.EMAILJS_PUBLIC_KEY && APP_CONFIG.EMAILJS_PUBLIC_KEY !== '__EMAILJS_PUBLIC_KEY__' &&
               APP_CONFIG.EMAILJS_SERVICE_ID && APP_CONFIG.EMAILJS_SERVICE_ID !== '__EMAILJS_SERVICE_ID__' &&
               APP_CONFIG.EMAILJS_TEMPLATE_ID && APP_CONFIG.EMAILJS_TEMPLATE_ID !== '__EMAILJS_TEMPLATE_ID__';
    }

    async function sendIntroductionEmail(contact) {
        if (!isConfigured()) {
            throw new Error('EmailJS is not configured. Please set up GitHub Secrets.');
        }

        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS failed to load. Please disable your ad-blocker or check your network connection.');
        }

        init();

        const templateParams = {
            to_email: contact.email,
            to_name: contact.personName || 'there',
            from_name: APP_CONFIG.OWNER_NAME,
            from_email: APP_CONFIG.OWNER_EMAIL,
            from_phone: APP_CONFIG.OWNER_PHONE,
            linkedin_url: APP_CONFIG.OWNER_LINKEDIN,
            meeting_notes: contact.notes || 'our recent meeting',
            business_name: contact.businessName || ''
        };

        const response = await emailjs.send(
            APP_CONFIG.EMAILJS_SERVICE_ID,
            APP_CONFIG.EMAILJS_TEMPLATE_ID,
            templateParams
        );

        return response;
    }

    return { sendIntroductionEmail, isConfigured, init };
})();
