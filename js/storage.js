// ============================================================
// storage.js — IndexedDB (via Dexie.js) CRUD for scanned cards
// ============================================================

const Storage = (() => {
    // ---- Database Initialization ----
    const db = new Dexie('CardScannerDB');
    
    // Schema: 
    // - contacts: All saved contacts (synced/unsynced)
    // - pendingScans: Images captured offline waiting for OCR
    // - outbox: Emails waiting for batch sending
    db.version(1).stores({
        contacts: '++id, personName, businessName, email, synced, createdAt',
        pendingScans: '++id, image, createdAt',
        outbox: '++id, to_email, to_name, sent, createdAt'
    });

    // ---- Migration from localStorage ----
    async function migrateFromLocalStorage() {
        const OLD_STORAGE_KEY = 'vcscanner_cards';
        const oldData = localStorage.getItem(OLD_STORAGE_KEY);
        if (oldData) {
            try {
                const cards = JSON.parse(oldData);
                if (Array.isArray(cards) && cards.length > 0) {
                    // Import only if the target table is empty to avoid duplicates
                    const count = await db.contacts.count();
                    if (count === 0) {
                        const contactsToImport = cards.map(c => ({
                            ...c,
                            synced: 0 // Assume old cards are unsynced
                        }));
                        await db.contacts.bulkAdd(contactsToImport);
                        console.log('Migrated data from localStorage to IndexedDB');
                        // Optional: Clear old storage after successful migration
                        // localStorage.removeItem(OLD_STORAGE_KEY);
                    }
                }
            } catch (e) {
                console.error('Migration failed:', e);
            }
        }
    }

    migrateFromLocalStorage();

    // ---- Contact Methods (Async) ----
    async function getAll() {
        return await db.contacts.orderBy('createdAt').reverse().toArray();
    }

    async function save(contact) {
        const card = {
            ...contact,
            synced: 0,
            createdAt: new Date().toISOString()
        };
        const id = await db.contacts.add(card);
        card.id = id;
        return card;
    }

    async function update(id, updatedContact) {
        const numericId = parseInt(id, 10);
        await db.contacts.update(id, updatedContact);
        return await db.contacts.get(id);
    }

    async function remove(id) {
        await db.contacts.delete(id);
    }

    async function getById(id) {
        return await db.contacts.get(id);
    }

    async function search(query) {
        if (!query) return await getAll();
        const q = query.toLowerCase();
        return await db.contacts
            .filter(c => 
                (c.personName && c.personName.toLowerCase().includes(q)) ||
                (c.businessName && c.businessName.toLowerCase().includes(q)) ||
                (c.email && c.email.toLowerCase().includes(q)) ||
                (c.mobile1 && c.mobile1.includes(q)) ||
                (c.notes && c.notes.toLowerCase().includes(q))
            )
            .reverse()
            .toArray();
    }

    async function clearAll() {
        await db.contacts.clear();
    }

    // ---- Pending Scan Methods ----
    async function addPendingScan(image) {
        return await db.pendingScans.add({
            image, // Base64 or Blob
            createdAt: new Date().toISOString()
        });
    }

    async function getPendingScans() {
        return await db.pendingScans.toArray();
    }

    async function removePendingScan(id) {
        await db.pendingScans.delete(id);
    }

    // ---- Outbox Methods ----
    async function addToOutbox(emailParams) {
        return await db.outbox.add({
            ...emailParams,
            sent: 0,
            createdAt: new Date().toISOString()
        });
    }

    async function getOutbox() {
        return await db.outbox.where('sent').equals(0).toArray();
    }

    async function markAsSent(id) {
        await db.outbox.update(id, { sent: 1 });
    }

    // ---- Google Sheets Integration ----
    function isSheetsConfigured() {
        return APP_CONFIG.GOOGLE_SHEETS_URL && APP_CONFIG.GOOGLE_SHEETS_URL !== '__GOOGLE_SHEETS_URL__';
    }

    async function syncToSheet() {
        if (!isSheetsConfigured()) return;
        const cards = await getAll();
        const authHash = APP_CONFIG.AUTH_HASH;

        try {
            await fetch(APP_CONFIG.GOOGLE_SHEETS_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ 
                    action: 'sync_to_sheet',
                    token: authHash,
                    data: cards 
                })
            });
            // Mark as synced locally
            await db.contacts.toCollection().modify({ synced: 1 });
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
            const response = await fetch(APP_CONFIG.GOOGLE_SHEETS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
                body: JSON.stringify({ 
                    action: 'load_from_sheet',
                    token: authHash
                })
            });
            const text = await response.text();
            const remoteData = JSON.parse(text);
            
            if (Array.isArray(remoteData)) {
                await db.contacts.clear();
                await db.contacts.bulkAdd(remoteData);
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
        addPendingScan, getPendingScans, removePendingScan,
        addToOutbox, getOutbox, markAsSent,
        isSheetsConfigured, syncToSheet, restoreFromSheet 
    };
})();
