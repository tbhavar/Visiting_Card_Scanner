// ============================================================
// ocr.js — Tesseract.js v6 OCR integration
// ============================================================

const OCR = (() => {
    let worker = null;

    async function getWorker() {
        if (!worker) {
            worker = await Tesseract.createWorker('eng', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        updateProgress(Math.round(m.progress * 100));
                    }
                }
            });
        }
        return worker;
    }

    function updateProgress(percent) {
        const bar = document.getElementById('ocr-progress-bar');
        const text = document.getElementById('ocr-progress-text');
        if (bar) {
            bar.style.width = percent + '%';
        }
        if (text) {
            text.textContent = percent + '%';
        }
    }

    function showProgress() {
        const container = document.getElementById('ocr-progress');
        if (container) container.classList.remove('hidden');
        updateProgress(0);
    }

    function hideProgress() {
        const container = document.getElementById('ocr-progress');
        if (container) container.classList.add('hidden');
    }

    async function scanImage(imageSource) {
        showProgress();
        try {
            const w = await getWorker();
            const { data: { text } } = await w.recognize(imageSource);
            return text;
        } finally {
            hideProgress();
        }
    }

    async function scanMultipleImages(files) {
        const results = [];
        for (let i = 0; i < files.length; i++) {
            const text = await scanImage(files[i]);
            results.push(text);
        }
        return results.join('\n---\n');
    }

    return { scanImage, scanMultipleImages };
})();
