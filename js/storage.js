// ============================================================
// storage.js — localStorage CRUD for scanned cards
// ============================================================

const Storage = (() => {
    const STORAGE_KEY = 'vcscanner_cards';

    function getAll() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    function save(contact) {
        const cards = getAll();
        const card = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            ...contact,
            createdAt: new Date().toISOString()
        };
        cards.unshift(card);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
        return card;
    }

    function update(id, updatedContact) {
        const cards = getAll();
        const idx = cards.findIndex(c => c.id === id);
        if (idx !== -1) {
            cards[idx] = { ...cards[idx], ...updatedContact };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
            return cards[idx];
        }
        return null;
    }

    function remove(id) {
        const cards = getAll().filter(c => c.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    }

    function getById(id) {
        return getAll().find(c => c.id === id) || null;
    }

    function search(query) {
        if (!query) return getAll();
        const q = query.toLowerCase();
        return getAll().filter(c =>
            (c.personName && c.personName.toLowerCase().includes(q)) ||
            (c.businessName && c.businessName.toLowerCase().includes(q)) ||
            (c.email && c.email.toLowerCase().includes(q)) ||
            (c.mobile1 && c.mobile1.includes(q)) ||
            (c.notes && c.notes.toLowerCase().includes(q))
        );
    }

    function clearAll() {
        localStorage.removeItem(STORAGE_KEY);
    }

    // ---- Google Sheets Integration ----
    function isSheetsConfigured() {
        return APP_CONFIG.GOOGLE_SHEETS_URL && APP_CONFIG.GOOGLE_SHEETS_URL !== '__GOOGLE_SHEETS_URL__';
    }

    async function syncToSheet() {
        if (!isSheetsConfigured()) return;
        const cards = getAll();
        
        // Use the auth hash as a simple security token so the script only accepts requests from his app
        const authHash = APP_CONFIG.AUTH_HASH;

        try {
            const response = await fetch(APP_CONFIG.GOOGLE_SHEETS_URL, {
                method: 'POST',
                mode: 'no-cors', // Use no-cors as Apps Script redirects often cause CORS issues
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'sync_to_sheet',
                    token: authHash,
                    data: cards 
                })
            });
            return true;
        } catch (err) {
            console.error('Sheets Sync Failed:', err);
            return false;
        }
    }

    async function restoreFromSheet() {
        if (!isSheetsConfigured()) return [];
        const authHash = APP_CONFIG.AUTH_HASH;

        try {
            // Since we can't easily do CORS GET for data from Apps Script no-cors mode, 
            // we'll use a POST for retrieval too.
            const response = await fetch(APP_CONFIG.GOOGLE_SHEETS_URL, {
                method: 'POST',
                // mode: 'cors' — For reading data, we need CORS. 
                // We'll instruct the user to handle this in the Apps Script Guide.
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
                body: JSON.stringify({ 
                    action: 'load_from_sheet',
                    token: authHash
                })
            });
            const text = await response.text();
            const remoteData = JSON.parse(text);
            
            if (Array.isArray(remoteData)) {
                // Merge or Replace? Let's replace for now to ensure clean restore.
                localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
                return remoteData;
            }
            return [];
        } catch (err) {
            console.error('Sheets Restore Failed:', err);
            throw err;
        }
    }

    return { 
        getAll, save, update, remove, getById, search, clearAll, 
        isSheetsConfigured, syncToSheet, restoreFromSheet 
    };
})();
