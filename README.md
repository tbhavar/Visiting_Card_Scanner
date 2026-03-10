# 📇 Card Scanner — Visiting Card to Contact

A Progressive Web App that scans visiting cards using AI-powered OCR, extracts contact details, and exports VCF files for import into Google Contacts.

## ✨ Features

- 📸 **Scan Cards** — Upload or photograph visiting cards
- 🤖 **AI-Powered OCR** — Gemini 2.5 Flash Lite API (state-of-the-art extraction)
- ☁️ **Cloud Sync** — Automatic backup to Google Sheets via Apps Script
- 🧠 **Smart Field Detection** — Auto-categorizes: Name, Business, Phone(s), Email, Address
- 📝 **Notes** — Add meeting context, event details, or memory references
- 📇 **VCF Export** — Download vCard 3.0 files for Gmail/Google Contacts import
- 📧 **Auto Email** — Send introduction emails with your contact details via EmailJS
- 🔒 **Password Protected** — Admin access gate (password stored in GitHub Secrets)
- 📱 **PWA** — Installable, works offline, responsive on all devices
- 🚀 **GitHub Actions** — Auto-deploys to GitHub Pages on push

---

### ☁️ Sync & Backup
To enable the Google Sheets cloud backup feature, follow the instructions in:
👉 [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md)

### 📧 Email Configuration
To enable the intro email feature, follow the instructions in:
👉 [EMAILJS_SETUP.md](EMAILJS_SETUP.md)

## 🚀 Quick Start

### 1️⃣ Clone & Configure

```bash
git clone https://github.com/your-username/Visiting_Card_Scanner.git
```

### 2️⃣ Set Up GitHub Secrets

See 👉 [EMAILJS_SETUP.md](EMAILJS_SETUP.md) for detailed instructions.

Required secrets:
- 🔑 `AUTH_PASSWORD_HASH` — SHA-256 hash of your password
- 🔑 `GEMINI_API_KEY` — Google Gemini API Key
- 🔑 `APP_URL` — Your deployed App URL (e.g. `https://your-username.github.io/Visiting_Card_Scanner`)
- 🔑 `GOOGLE_SHEETS_APP_URL` — Your deployed Apps Script web app URL
- 🔑 `EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`
- 🔑 `OWNER_NAME`, `OWNER_EMAIL`, `OWNER_PHONE`, `OWNER_LINKEDIN`

### 3️⃣ Enable GitHub Pages

Go to repo **Settings** ⚙️ → **Pages** 📄 → Set source to **GitHub Actions** 🚀

### 4️⃣ Push to Deploy

```bash
git add .
git commit -m "Initial release"
git push origin main
```

Visit: 🌐 `https://your-username.github.io/Visiting_Card_Scanner/`

## 💻 Local Development

For local testing, replace placeholders in `js/config.js` with actual values, then run:

```bash
npx serve .
```

Then open 🌐 `http://localhost:3000`

## 🛠️ Tech Stack

- 🌐 HTML5 + CSS3 + Vanilla JavaScript
- 🧠 Gemini 2.5 Flash Lite API (OCR & Extraction)
- 📧 EmailJS (Email sending)
- ☁️ Google Apps Script (Sheets Sync)
- 🚀 GitHub Actions + GitHub Pages (CI/CD)

## ☕ Support The Author

If you find this project helpful, consider supporting the development!

<a href="https://buymeacoffee.com/tbhavar" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## 📜 License

MIT
