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

    return { getAll, save, update, remove, getById, search, clearAll };
})();
