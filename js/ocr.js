// ============================================================
// ocr.js — Gemini 1.5 Flash API Integration
// ============================================================

const OCR = (() => {
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Data = reader.result.split(',')[1];
                resolve({
                    inlineData: {
                        data: base64Data,
                        mimeType: file.type
                    }
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function showProgress() {
        const container = document.getElementById('ocr-progress');
        const text = document.getElementById('ocr-progress-text');
        const bar = document.getElementById('ocr-progress-bar');
        if (container) container.classList.remove('hidden');
        if (text) text.textContent = 'Extracting details with AI...';
        if (bar) bar.style.width = '100%';
    }

    function hideProgress() {
        const container = document.getElementById('ocr-progress');
        if (container) container.classList.add('hidden');
    }

    async function scanImage(file) {
        showProgress();
        try {
            const apiKey = APP_CONFIG.GEMINI_API_KEY;
            
            if (!apiKey || apiKey === '__GEMINI_API_KEY__') {
                throw new Error("Gemini API Key is missing. App is not deployed securely or key is wrong.");
            }

            const imagePart = await fileToBase64(file);

            const prompt = `You are an expert visiting card parser. Extract the details from this image and return a JSON object populated with the following keys. Do not include markdown or backticks.
{
  "personName": "",
  "businessName": "",
  "mobile1": "",
  "mobile2": "",
  "mobile3": "",
  "email": "",
  "address": "",
  "notes": "Any other context from the card like website, tagline, or designation"
}`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            imagePart
                        ]
                    }],
                    generationConfig: {
                        responseMimeType: "application/json"
                    }
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || "Gemini API request failed");
            }

            const data = await response.json();
            const textResponse = data.candidates[0].content.parts[0].text;
            
            return JSON.parse(textResponse);
        } catch (err) {
            console.error("Gemini OCR Error:", err);
            throw err;
        } finally {
            hideProgress();
        }
    }

    return { scanImage };
})();
