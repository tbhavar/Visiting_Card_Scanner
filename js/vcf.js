// ============================================================
// vcf.js — vCard 3.0 generation and download
// ============================================================

const VCF = (() => {
    function escapeVCF(str) {
        if (!str) return '';
        return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
    }

    function generateVCF(contact) {
        const lines = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${escapeVCF(contact.personName)}`,
            `N:${escapeVCF(contact.personName)};;;;`
        ];

        if (contact.businessName) {
            lines.push(`ORG:${escapeVCF(contact.businessName)}`);
        }

        if (contact.mobile1) {
            lines.push(`TEL;TYPE=CELL:${contact.mobile1}`);
        }
        if (contact.mobile2) {
            lines.push(`TEL;TYPE=CELL:${contact.mobile2}`);
        }
        if (contact.mobile3) {
            lines.push(`TEL;TYPE=CELL:${contact.mobile3}`);
        }

        if (contact.email) {
            lines.push(`EMAIL;TYPE=INTERNET:${escapeVCF(contact.email)}`);
        }

        if (contact.address) {
            lines.push(`ADR;TYPE=WORK:;;${escapeVCF(contact.address)};;;;`);
        }

        if (contact.notes) {
            lines.push(`NOTE:${escapeVCF(contact.notes)}`);
        }

        lines.push('END:VCARD');
        return lines.join('\r\n');
    }

    function downloadVCF(contact) {
        const vcfContent = generateVCF(contact);
        const filename = (contact.personName || 'contact').replace(/[^a-zA-Z0-9]/g, '_') + '.vcf';
        triggerDownload(vcfContent, filename);
    }

    function downloadAllVCF(contacts) {
        if (!contacts || contacts.length === 0) return;
        const vcfContent = contacts.map(c => generateVCF(c)).join('\r\n');
        triggerDownload(vcfContent, 'all_contacts.vcf');
    }

    function triggerDownload(content, filename) {
        const blob = new Blob([content], { type: 'text/vcard;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return { generateVCF, downloadVCF, downloadAllVCF };
})();
