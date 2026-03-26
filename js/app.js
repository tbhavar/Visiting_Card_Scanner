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
            syncControls: document.getElementById('sync-controls'),
            btnSyncToCloud: document.getElementById('btn-sync-to-cloud'),
            btnSyncFromCloud: document.getElementById('btn-sync-from-cloud'),

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
        
        // Convert FileList to Array for easier iteration
        const fileArray = Array.from(files);
        
        showToast(`Processing ${fileArray.length} card(s)...`, 'info');

        fileArray.forEach(file => {
            if (!file.type.startsWith('image/')) {
                showToast(`Skipping non-image file: ${file.name}`, 'warning');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                // For batch mode, we don't necessarily update the preview for every file immediately
                // but we process each one.
                if (fileArray.length === 1) {
                    currentImageDataUrl = e.target.result;
                    els.imagePreview.src = currentImageDataUrl;
                    els.previewContainer.classList.remove('hidden');
                    els.dropZone.classList.add('has-image');
                }
                processImage(file);
            };
            reader.readAsDataURL(file);
        });
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
            const parsedData = await OCR.scanImage(file);
            populateForm(parsedData);
        } catch (err) {
            showToast('Scan failed: ' + err.message, 'error');
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
    async function handleSave() {
        const data = getFormData();
        if (!data.personName && !data.businessName) {
            showToast('Please fill at least a name or business name.', 'error');
            return;
        }
        await Storage.save(data);
        showToast('Contact saved locally!');
        
        // Auto-sync if enabled
        if (Storage.isSheetsConfigured() && navigator.onLine) {
            await Storage.syncToSheet();
        }

        clearForm();
        await renderCards();
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

        // If offline, add to outbox
        if (!navigator.onLine) {
            await Storage.addToOutbox(data);
            showToast('Added to email outbox (will send when online).');
            clearForm();
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
    async function renderCards(query) {
        let cards = [];
        try {
            cards = query ? await Storage.search(query) : await Storage.getAll();
        } catch (e) {
            console.error('Storage error:', e);
        }
        
        els.cardsContainer.innerHTML = '';

        // Also check for pending scans
        const pendingScans = await Storage.getPendingScans();
        if (pendingScans.length > 0) {
            renderPendingScans(pendingScans);
        }

        if (cards.length === 0 && pendingScans.length === 0) {
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

    function renderPendingScans(scans) {
        scans.forEach(scan => {
            const div = document.createElement('div');
            div.className = 'card-item pending-card';
            div.innerHTML = `
                <div style="display:flex; align-items:center; gap:12px; opacity: 0.7;">
                    <div class="spinner-small"></div>
                    <div>
                        <h3 style="margin:0; font-size: 15px;">Pending Capture...</h3>
                        <p style="margin:0; font-size:12px; color:var(--text-muted)">Waiting for network to scan card</p>
                    </div>
                </div>
            `;
            els.cardsContainer.appendChild(div);
        });
    }

    function createCardElement(card) {
        const div = document.createElement('div');
        div.className = `card-item ${card.synced === 0 ? 'unsynced' : ''}`;
        div.dataset.id = card.id;

        const initials = (card.personName || 'C').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

        div.innerHTML = `
            <div class="card-item-header">
                <div class="card-avatar">${initials}</div>
                <div class="card-info">
                    <h3 class="card-name">${escapeHTML(card.personName || 'Unknown')}</h3>
                    <p class="card-business">${escapeHTML(card.businessName || '')}</p>
                </div>
                ${card.synced === 0 ? '<div class="sync-badge" title="Not synced to cloud"></div>' : ''}
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

    async function downloadCardVcf(id) {
        const card = await Storage.getById(id);
        if (card) {
            VCF.downloadVCF(card);
            showToast('VCF downloaded!');
        }
    }

    async function sendCardEmail(id) {
        const card = await Storage.getById(id);
        if (card && card.email) {
            // Handle offline
            if (!navigator.onLine) {
                await Storage.addToOutbox(card);
                showToast('Added to email outbox.');
                return;
            }

            try {
                await EmailService.sendIntroductionEmail(card);
                showToast('Email sent successfully!');
            } catch (err) {
                showToast('Failed to send email: ' + err.message, 'error');
            }
        }
    }

    async function deleteCard(id) {
        if (confirm('Delete this contact?')) {
            await Storage.remove(id);
            await renderCards();
            showToast('Contact deleted.');
        }
    }

    async function handleDownloadAll() {
        const cards = await Storage.getAll();
        if (cards.length === 0) {
            showToast('No contacts to download.', 'error');
            return;
        }
        VCF.downloadAllVCF(cards);
        showToast('All contacts downloaded as VCF!');
    }

    async function handleSyncToCloud() {
        els.btnSyncToCloud.disabled = true;
        els.btnSyncToCloud.textContent = 'Syncing...';
        try {
            await Storage.syncToSheet();
            showToast('Backup successful!', 'success');
            await renderCards(); // Refresh to hide sync badges
        } catch (err) {
            showToast('Backup failed: ' + err.message, 'error');
        } finally {
            els.btnSyncToCloud.disabled = false;
            els.btnSyncToCloud.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Cloud Sync
            `;
        }
    }

    async function handleSyncFromCloud() {
        if (!confirm('This will replace your local contacts with the data from Google Sheets. Continue?')) return;
        
        els.btnSyncFromCloud.disabled = true;
        els.btnSyncFromCloud.textContent = 'Restoring...';
        try {
            const data = await Storage.restoreFromSheet();
            await renderCards();
            showToast(`Restored ${data.length} contacts!`, 'success');
        } catch (err) {
            showToast('Restore failed: ' + err.message, 'error');
        } finally {
            els.btnSyncFromCloud.disabled = false;
            els.btnSyncFromCloud.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Restore Backup
            `;
        }
    }

    // ---- Auto-OCR Integration ----
    async function processImage(file) {
        els.contactForm.classList.add('hidden');
        els.ocrProgress.classList.remove('hidden');
        els.rawTextOutput.classList.add('hidden');

        // Handle Offline Flow
        if (!navigator.onLine) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                await Storage.addPendingScan(e.target.result);
                els.ocrProgress.classList.add('hidden');
                showToast('Offline: Image saved for auto-scan when online.', 'info');
                clearForm();
                await renderCards();
            };
            reader.readAsDataURL(file);
            return;
        }

        try {
            const parsedData = await OCR.scanImage(file);
            populateForm(parsedData);
        } catch (err) {
            showToast('Scan failed: ' + err.message, 'error');
        } finally {
            els.ocrProgress.classList.add('hidden');
        }
    }

    // Background Sync Monitor
    function setupConnectivityMonitor() {
        window.addEventListener('online', async () => {
            showToast('Back online! Processing pending tasks...', 'info');
            await processPendingTasks();
        });
    }

    async function processPendingTasks() {
        // 1. Process Pending Scans (Cloud OCR)
        const scans = await Storage.getPendingScans();
        for (const scan of scans) {
            try {
                // Convert base64 to File/Blob for OCR
                const res = await fetch(scan.image);
                const blob = await res.blob();
                const parsedData = await OCR.scanImage(blob);
                await Storage.save(parsedData);
                await Storage.removePendingScan(scan.id);
            } catch (e) {
                console.error('Pending scan failed:', e);
            }
        }

        // 2. Process Outbox Emails
        const emails = await Storage.getOutbox();
        for (const email of emails) {
            try {
                await EmailService.sendIntroductionEmail(email);
                await Storage.markAsSent(email.id);
            } catch (e) {
                console.error('Outbox send failed:', e);
            }
        }

        // 3. Auto-Sync to Sheets if configured
        if (Storage.isSheetsConfigured()) {
            await Storage.syncToSheet();
        }

        await renderCards();
    }

    // ---- Initialize ----
    async function init() {
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
        els.btnSyncToCloud.addEventListener('click', handleSyncToCloud);
        els.btnSyncFromCloud.addEventListener('click', handleSyncFromCloud);

        // Check if sync is enabled
        if (Storage.isSheetsConfigured()) {
            els.syncControls.classList.remove('hidden');
        }

        // Download all
        els.btnDownloadAll.addEventListener('click', handleDownloadAll);

        // Render saved cards
        await renderCards();

        // Init EmailJS
        EmailService.init();

        // Setup Connectivity Monitor
        setupConnectivityMonitor();
        if (navigator.onLine) {
            processPendingTasks();
        }
    }

    document.addEventListener('DOMContentLoaded', init);

    return { downloadCardVcf, sendCardEmail, deleteCard };
})();
