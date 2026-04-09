// ============================================================
// connect.js — Visitor registration logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initPage();
    setupEventListeners();
});

function initPage() {
    // Populate owner info from config
    const ownerName = document.getElementById('owner-name');
    const ownerTitle = document.getElementById('owner-title');
    const ownerPhoto = document.getElementById('owner-photo');

    if (APP_CONFIG.OWNER_NAME && !APP_CONFIG.OWNER_NAME.includes('__')) {
        ownerName.textContent = APP_CONFIG.OWNER_NAME;
    }
    if (APP_CONFIG.OWNER_TITLE && !APP_CONFIG.OWNER_TITLE.includes('__')) {
        ownerTitle.textContent = APP_CONFIG.OWNER_TITLE;
    }
    if (APP_CONFIG.OWNER_PHOTO_URL && !APP_CONFIG.OWNER_PHOTO_URL.includes('__')) {
        ownerPhoto.src = APP_CONFIG.OWNER_PHOTO_URL;
    }

    // Set up action buttons for success state
    const vcfLink = document.getElementById('btn-save-vcf');
    if (APP_CONFIG.OWNER_VCF_URL && !APP_CONFIG.OWNER_VCF_URL.includes('__')) {
        vcfLink.href = APP_CONFIG.OWNER_VCF_URL;
    } else {
        vcfLink.classList.add('hidden');
    }

    const linkedinLink = document.getElementById('btn-linkedin');
    if (APP_CONFIG.OWNER_LINKEDIN && !APP_CONFIG.OWNER_LINKEDIN.includes('__')) {
        linkedinLink.href = APP_CONFIG.OWNER_LINKEDIN;
    } else {
        linkedinLink.classList.add('hidden');
    }
}

function setupEventListeners() {
    const form = document.getElementById('connect-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submit-btn');
    const originalBtnText = submitBtn.innerHTML;
    
    // Disable button & show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Processing...';

    const visitorData = {
        name: document.getElementById('visitor-name').value,
        email: document.getElementById('visitor-email').value,
        meeting: document.getElementById('visitor-meeting').value,
        timestamp: new Date().toLocaleString('en-IN')
    };

    try {
        // 1. Send Digital Card via Email
        const emailPromise = EmailService.sendIntroductionEmail({
            email: visitorData.email,
            personName: visitorData.name,
            notes: visitorData.meeting || 'our meeting',
            businessName: 'Visitor'
        });

        // 2. Backup to Google Sheets
        const sheetsPromise = backupToSheets(visitorData);

        // Parallel execution
        await Promise.all([emailPromise, sheetsPromise]);

        // Success Transition
        document.getElementById('form-container').classList.add('hidden');
        document.getElementById('success-container').classList.remove('hidden');
        
        showToast('Details shared and email sent!', 'success');
    } catch (err) {
        console.error('Submission failed:', err);
        showToast('Submission failed. Check your connection.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

async function backupToSheets(data) {
    const sheetsUrl = APP_CONFIG.GOOGLE_SHEETS_URL;
    if (!sheetsUrl || sheetsUrl.includes('__')) {
        console.warn('Google Sheets URL not configured.');
        return;
    }

    try {
        // We use no-cors because Apps Script redirects cause CORS errors even on success
        await fetch(sheetsUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'add_visitor_lead',
                token: APP_CONFIG.AUTH_HASH,
                data: data
            })
        });
        return true;
    } catch (err) {
        console.error('Sheets backup failed:', err);
        // We don't throw here to ensure the UI still progresses if just backup fails
        return false;
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}
