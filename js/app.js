// ============================================================
// app.js — Main application bootstrap and event wiring
// ============================================================

const App = (() => {
    // DOM element references
    let els = {};

    function cacheElements() {
        els = {
            authOverlay: document.getElementById('auth-overlay'),
            authForm: document.getElementById('auth-form'),
            authPassword: document.getElementById('auth-password'),
            authError: document.getElementById('auth-error'),
            authSubmit: document.getElementById('auth-submit'),
            appMain: document.getElementById('app-main'),

            dropZone: document.getElementById('drop-zone'),
            fileInput: document.getElementById('file-input'),
            cameraBtn: document.getElementById('camera-btn'),
            uploadBtn: document.getElementById('upload-btn'),
            imagePreview: document.getElementById('image-preview'),
            previewContainer: document.getElementById('preview-container'),
            clearPreview: document.getElementById('clear-preview'),

            ocrProgress: document.getElementById('ocr-progress'),
            ocrProgressBar: document.getElementById('ocr-progress-bar'),
            ocrProgressText: document.getElementById('ocr-progress-text'),
            rawTextOutput: document.getElementById('raw-text-output'),

            contactForm: document.getElementById('contact-form'),
            fieldPersonName: document.getElementById('field-person-name'),
            fieldBusinessName: document.getElementById('field-business-name'),
            fieldMobile1: document.getElementById('field-mobile1'),
            fieldMobile2: document.getElementById('field-mobile2'),
            fieldMobile3: document.getElementById('field-mobile3'),
            fieldEmail: document.getElementById('field-email'),
            fieldAddress: document.getElementById('field-address'),
            fieldNotes: document.getElementById('field-notes'),

            btnSave: document.getElementById('btn-save'),
            btnDownloadVcf: document.getElementById('btn-download-vcf'),
            btnSendEmail: document.getElementById('btn-send-email'),
            btnClear: document.getElementById('btn-clear'),

            cardsList: document.getElementById('cards-list'),
            cardsContainer: document.getElementById('cards-container'),
            searchInput: document.getElementById('search-input'),
            btnDownloadAll: document.getElementById('btn-download-all'),
            emptyState: document.getElementById('empty-state'),

            toast: document.getElementById('toast'),
            toastMessage: document.getElementById('toast-message')
        };
    }

    // ---- Toast notifications ----
    function showToast(message, type = 'success') {
        els.toast.className = `toast show ${type}`;
        els.toastMessage.textContent = message;
        setTimeout(() => {
            els.toast.className = 'toast';
        }, 3500);
    }

    // ---- Auth flow ----
    async function handleAuth(e) {
        e.preventDefault();
        els.authError.textContent = '';
        els.authSubmit.disabled = true;
        els.authSubmit.textContent = 'Verifying...';

        const password = els.authPassword.value;
        const success = await Auth.login(password);

        if (success) {
            els.authOverlay.classList.add('fade-out');
            setTimeout(() => {
                els.authOverlay.classList.add('hidden');
                els.appMain.classList.remove('hidden');
            }, 400);
        } else {
            els.authError.textContent = 'Incorrect password. Please try again.';
            els.authPassword.value = '';
            els.authPassword.focus();
        }

        els.authSubmit.disabled = false;
        els.authSubmit.textContent = 'Unlock';
    }

    function checkAuth() {
        if (Auth.isAuthenticated()) {
            els.authOverlay.classList.add('hidden');
            els.appMain.classList.remove('hidden');
        } else {
            els.authOverlay.classList.remove('hidden');
            els.appMain.classList.add('hidden');
        }
    }

    // ---- Image upload ----
    let currentImageDataUrl = null;

    function handleFiles(files) {
        if (!files || files.length === 0) return;
        const file = files[0];
        if (!file.type.startsWith('image/')) {
            showToast('Please upload an image file.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            currentImageDataUrl = e.target.result;
            els.imagePreview.src = currentImageDataUrl;
            els.previewContainer.classList.remove('hidden');
            els.dropZone.classList.add('has-image');
            processImage(file);
        };
        reader.readAsDataURL(file);
    }

    function setupDragDrop() {
        els.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            els.dropZone.classList.add('drag-over');
        });

        els.dropZone.addEventListener('dragleave', () => {
            els.dropZone.classList.remove('drag-over');
        });

        els.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            els.dropZone.classList.remove('drag-over');
            handleFiles(e.dataTransfer.files);
        });

        els.uploadBtn.addEventListener('click', () => {
            els.fileInput.setAttribute('capture', '');
            els.fileInput.removeAttribute('capture');
            els.fileInput.click();
        });

        els.cameraBtn.addEventListener('click', () => {
            els.fileInput.setAttribute('capture', 'environment');
            els.fileInput.click();
        });

        els.fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });

        els.clearPreview.addEventListener('click', clearForm);
    }

    // ---- OCR Processing ----
    async function processImage(file) {
        els.contactForm.classList.add('hidden');
        els.ocrProgress.classList.remove('hidden');
        els.rawTextOutput.classList.add('hidden');

        try {
            const text = await OCR.scanImage(file);

            // Show raw text
            els.rawTextOutput.textContent = text;
            els.rawTextOutput.classList.remove('hidden');

            // Parse fields
            const parsed = Parser.parseBusinessCard(text);
            populateForm(parsed);
        } catch (err) {
            showToast('OCR failed: ' + err.message, 'error');
        }
    }

    function populateForm(data) {
        els.fieldPersonName.value = data.personName || '';
        els.fieldBusinessName.value = data.businessName || '';
        els.fieldMobile1.value = data.mobile1 || '';
        els.fieldMobile2.value = data.mobile2 || '';
        els.fieldMobile3.value = data.mobile3 || '';
        els.fieldEmail.value = data.email || '';
        els.fieldAddress.value = data.address || '';
        els.fieldNotes.value = data.notes || '';
        els.contactForm.classList.remove('hidden');

        // Show/hide email button
        updateEmailButton();
    }

    function getFormData() {
        return {
            personName: els.fieldPersonName.value.trim(),
            businessName: els.fieldBusinessName.value.trim(),
            mobile1: els.fieldMobile1.value.trim(),
            mobile2: els.fieldMobile2.value.trim(),
            mobile3: els.fieldMobile3.value.trim(),
            email: els.fieldEmail.value.trim(),
            address: els.fieldAddress.value.trim(),
            notes: els.fieldNotes.value.trim(),
            imageDataUrl: currentImageDataUrl
        };
    }

    function clearForm() {
        els.fieldPersonName.value = '';
        els.fieldBusinessName.value = '';
        els.fieldMobile1.value = '';
        els.fieldMobile2.value = '';
        els.fieldMobile3.value = '';
        els.fieldEmail.value = '';
        els.fieldAddress.value = '';
        els.fieldNotes.value = '';
        els.contactForm.classList.add('hidden');
        els.previewContainer.classList.add('hidden');
        els.rawTextOutput.classList.add('hidden');
        els.dropZone.classList.remove('has-image');
        els.fileInput.value = '';
        currentImageDataUrl = null;
    }

    function updateEmailButton() {
        if (els.btnSendEmail) {
            const hasEmail = els.fieldEmail.value.trim() !== '';
            const emailConfigured = EmailService.isConfigured();
            els.btnSendEmail.disabled = !hasEmail || !emailConfigured;
            if (!emailConfigured) {
                els.btnSendEmail.title = 'EmailJS not configured';
            } else if (!hasEmail) {
                els.btnSendEmail.title = 'No email address detected';
            } else {
                els.btnSendEmail.title = 'Send introduction email';
            }
        }
    }

    // ---- Card actions ----
    function handleSave() {
        const data = getFormData();
        if (!data.personName && !data.businessName) {
            showToast('Please fill at least a name or business name.', 'error');
            return;
        }
        Storage.save(data);
        showToast('Contact saved successfully!');
        clearForm();
        renderCards();
    }

    function handleDownloadVcf() {
        const data = getFormData();
        if (!data.personName) {
            showToast('Please fill in the person name.', 'error');
            return;
        }
        VCF.downloadVCF(data);
        showToast('VCF file downloaded!');
    }

    async function handleSendEmail() {
        const data = getFormData();
        if (!data.email) {
            showToast('No email address to send to.', 'error');
            return;
        }

        els.btnSendEmail.disabled = true;
        els.btnSendEmail.innerHTML = '<span class="spinner"></span> Sending...';

        try {
            await EmailService.sendIntroductionEmail(data);
            showToast('Introduction email sent successfully!');
        } catch (err) {
            showToast('Failed to send email: ' + err.message, 'error');
        } finally {
            els.btnSendEmail.disabled = false;
            els.btnSendEmail.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> Send Email';
        }
    }

    // ---- Cards list rendering ----
    function renderCards(query) {
        const cards = query ? Storage.search(query) : Storage.getAll();
        els.cardsContainer.innerHTML = '';

        if (cards.length === 0) {
            els.emptyState.classList.remove('hidden');
            els.btnDownloadAll.classList.add('hidden');
            return;
        }

        els.emptyState.classList.add('hidden');
        els.btnDownloadAll.classList.remove('hidden');

        cards.forEach(card => {
            const el = createCardElement(card);
            els.cardsContainer.appendChild(el);
        });
    }

    function createCardElement(card) {
        const div = document.createElement('div');
        div.className = 'card-item';
        div.dataset.id = card.id;

        const initials = (card.personName || 'C').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

        div.innerHTML = `
            <div class="card-item-header">
                <div class="card-avatar">${initials}</div>
                <div class="card-info">
                    <h3 class="card-name">${escapeHTML(card.personName || 'Unknown')}</h3>
                    <p class="card-business">${escapeHTML(card.businessName || '')}</p>
                </div>
            </div>
            <div class="card-details">
                ${card.mobile1 ? `<span class="card-detail"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> ${escapeHTML(card.mobile1)}</span>` : ''}
                ${card.email ? `<span class="card-detail"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> ${escapeHTML(card.email)}</span>` : ''}
            </div>
            ${card.notes ? `<p class="card-notes">${escapeHTML(card.notes)}</p>` : ''}
            <div class="card-actions">
                <button class="btn-icon" onclick="App.downloadCardVcf('${card.id}')" title="Download VCF">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </button>
                ${card.email && EmailService.isConfigured() ? `
                <button class="btn-icon" onclick="App.sendCardEmail('${card.id}')" title="Send Email">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </button>` : ''}
                <button class="btn-icon btn-danger" onclick="App.deleteCard('${card.id}')" title="Delete">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
            </div>
        `;
        return div;
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function downloadCardVcf(id) {
        const card = Storage.getById(id);
        if (card) {
            VCF.downloadVCF(card);
            showToast('VCF downloaded!');
        }
    }

    async function sendCardEmail(id) {
        const card = Storage.getById(id);
        if (card && card.email) {
            try {
                await EmailService.sendIntroductionEmail(card);
                showToast('Email sent successfully!');
            } catch (err) {
                showToast('Failed to send email: ' + err.message, 'error');
            }
        }
    }

    function deleteCard(id) {
        if (confirm('Delete this contact?')) {
            Storage.remove(id);
            renderCards();
            showToast('Contact deleted.');
        }
    }

    function handleDownloadAll() {
        const cards = Storage.getAll();
        if (cards.length === 0) {
            showToast('No contacts to download.', 'error');
            return;
        }
        VCF.downloadAllVCF(cards);
        showToast('All contacts downloaded as VCF!');
    }

    // ---- Initialize ----
    function init() {
        cacheElements();
        checkAuth();

        // Auth
        els.authForm.addEventListener('submit', handleAuth);

        // Upload
        setupDragDrop();

        // Form actions
        els.btnSave.addEventListener('click', handleSave);
        els.btnDownloadVcf.addEventListener('click', handleDownloadVcf);
        els.btnSendEmail.addEventListener('click', handleSendEmail);
        els.btnClear.addEventListener('click', clearForm);

        // Email field change
        els.fieldEmail.addEventListener('input', updateEmailButton);

        // Search
        els.searchInput.addEventListener('input', (e) => {
            renderCards(e.target.value);
        });

        // Download all
        els.btnDownloadAll.addEventListener('click', handleDownloadAll);

        // Render saved cards
        renderCards();

        // Init EmailJS
        EmailService.init();
    }

    document.addEventListener('DOMContentLoaded', init);

    return { downloadCardVcf, sendCardEmail, deleteCard };
})();
