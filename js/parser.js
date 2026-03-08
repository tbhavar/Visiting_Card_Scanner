// ============================================================
// parser.js — Smart field extraction from OCR text
// ============================================================

const Parser = (() => {
    const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
    const PHONE_REGEX = /(?:\+?\d{1,3}[\s\-.]?)?\(?\d{2,5}\)?[\s\-.]?\d{3,5}[\s\-.]?\d{3,5}/g;
    const URL_REGEX = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9\-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/g;
    const BUSINESS_SUFFIXES = /\b(?:ltd|llp|limited|inc|incorporated|corp|corporation|pvt|private|llc|co\b|company|enterprises|solutions|technologies|tech|group|associates|consultants|services|industries|foundation|partners)\b/i;
    const ADDRESS_INDICATORS = /\b(?:road|rd|street|st|avenue|ave|lane|ln|nagar|colony|sector|block|floor|plot|building|tower|office|suite|pin|zip|city|state|district|taluka|maharashtra|gujarat|karnataka|delhi|mumbai|pune|nashik|bangalore|hyderabad|chennai|kolkata|india|\d{6}|\d{5})\b/i;

    function parseBusinessCard(rawText) {
        const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        // Extract emails
        const emails = [];
        lines.forEach(line => {
            const found = line.match(EMAIL_REGEX);
            if (found) emails.push(...found);
        });

        // Extract phone numbers
        const phones = [];
        lines.forEach(line => {
            const found = line.match(PHONE_REGEX);
            if (found) {
                found.forEach(p => {
                    const digits = p.replace(/\D/g, '');
                    if (digits.length >= 7 && digits.length <= 15) {
                        phones.push(p.trim());
                    }
                });
            }
        });

        // Deduplicate phones
        const uniquePhones = [...new Set(phones.map(p => p.replace(/\D/g, '')))].map(digits => {
            return phones.find(p => p.replace(/\D/g, '') === digits);
        });

        // Classify lines
        const usedLines = new Set();
        let businessName = '';
        const addressParts = [];
        let personName = '';

        lines.forEach((line, idx) => {
            // Skip lines that are just emails, phones, or URLs
            const lineClean = line.replace(EMAIL_REGEX, '').replace(PHONE_REGEX, '').replace(URL_REGEX, '').trim();

            if (BUSINESS_SUFFIXES.test(line)) {
                if (!businessName) {
                    businessName = line;
                    usedLines.add(idx);
                }
            }

            if (ADDRESS_INDICATORS.test(line)) {
                addressParts.push(line);
                usedLines.add(idx);
            }
        });

        // Person name heuristic: first line that's not business, address, email, or phone-heavy
        for (let i = 0; i < lines.length; i++) {
            if (usedLines.has(i)) continue;
            const line = lines[i];
            const lineWithoutEmail = line.replace(EMAIL_REGEX, '').trim();
            const lineWithoutPhone = lineWithoutEmail.replace(PHONE_REGEX, '').trim();
            const digits = (line.match(/\d/g) || []).length;
            const letters = (line.match(/[a-zA-Z]/g) || []).length;

            // A name line should be mostly letters, not too long
            if (letters > digits && lineWithoutPhone.length > 1 && lineWithoutPhone.length < 50 && !BUSINESS_SUFFIXES.test(line) && !ADDRESS_INDICATORS.test(line)) {
                personName = lineWithoutPhone.replace(URL_REGEX, '').trim();
                usedLines.add(i);
                break;
            }
        }

        // If no business name found, try second line
        if (!businessName) {
            for (let i = 0; i < lines.length; i++) {
                if (usedLines.has(i)) continue;
                const line = lines[i];
                const digits = (line.match(/\d/g) || []).length;
                const letters = (line.match(/[a-zA-Z]/g) || []).length;
                if (letters > digits && line.length > 2 && !ADDRESS_INDICATORS.test(line)) {
                    businessName = line.replace(EMAIL_REGEX, '').replace(PHONE_REGEX, '').replace(URL_REGEX, '').trim();
                    usedLines.add(i);
                    break;
                }
            }
        }

        return {
            personName: personName || '',
            businessName: businessName || '',
            mobile1: uniquePhones[0] || '',
            mobile2: uniquePhones[1] || '',
            mobile3: uniquePhones[2] || '',
            email: emails[0] || '',
            address: addressParts.join(', ') || '',
            notes: ''
        };
    }

    return { parseBusinessCard };
})();
