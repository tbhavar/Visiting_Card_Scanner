# Card Scanner — Visiting Card to Contact

A Progressive Web App that scans visiting cards using OCR, extracts contact details, and exports VCF files for import into Google Contacts.

## Features

- 📸 **Scan Cards** — Upload or photograph visiting cards
- 🔍 **OCR Text Extraction** — Tesseract.js v6 (runs entirely in-browser)
- 🧠 **Smart Field Detection** — Auto-categorizes: Name, Business, Phone(s), Email, Address
- 📝 **Notes** — Add meeting context, event details, or memory references
- 📇 **VCF Export** — Download vCard 3.0 files for Gmail/Google Contacts import
- 📧 **Auto Email** — Send introduction emails with your contact details via EmailJS
- 🔒 **Password Protected** — Admin access gate (password stored in GitHub Secrets)
- 📱 **PWA** — Installable, works offline, responsive on all devices
- 🚀 **GitHub Actions** — Auto-deploys to GitHub Pages on push

## Quick Start

### 1. Clone & Configure

```bash
git clone https://github.com/tbhavar/Visiting_Card_Scanner.git
```

### 2. Set Up GitHub Secrets

See [EMAILJS_SETUP.md](EMAILJS_SETUP.md) for detailed instructions.

Required secrets:
- `AUTH_PASSWORD_HASH` — SHA-256 hash of your password
- `EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`
- `OWNER_NAME`, `OWNER_EMAIL`, `OWNER_PHONE`, `OWNER_LINKEDIN`

### 3. Enable GitHub Pages

Go to repo **Settings** → **Pages** → Set source to **GitHub Actions**

### 4. Push to Deploy

```bash
git add .
git commit -m "Initial release"
git push origin main
```

Visit: `https://tbhavar.github.io/Visiting_Card_Scanner/`

## Local Development

For local testing, replace placeholders in `js/config.js` with actual values:

```bash
npx serve .
```

Then open `http://localhost:3000`

## Tech Stack

- HTML5 + CSS3 + Vanilla JavaScript
- Tesseract.js v6 (OCR)
- EmailJS (email sending)
- GitHub Actions + GitHub Pages (CI/CD)

## License

MIT
