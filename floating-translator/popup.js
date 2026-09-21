// ============================================================
//  Floating AI Translator — Popup Script
// ============================================================
'use strict';

const LANGUAGES = [
    { code: 'vi',    name: '🇻🇳 Tiếng Việt',  bcp47: 'vi-VN' },
    { code: 'en',    name: '🇺🇸 English',       bcp47: 'en-US' },
    { code: 'zh-CN', name: '🇨🇳 中文 (简体)',    bcp47: 'zh-CN' },
    { code: 'zh-TW', name: '🇹🇼 中文 (繁體)',    bcp47: 'zh-TW' },
    { code: 'ja',    name: '🇯🇵 日本語',         bcp47: 'ja-JP' },
    { code: 'ko',    name: '🇰🇷 한국어',         bcp47: 'ko-KR' },
    { code: 'th',    name: '🇹🇭 ภาษาไทย',       bcp47: 'th-TH' },
    { code: 'es',    name: '🇪🇸 Español',        bcp47: 'es-ES' },
    { code: 'fr',    name: '🇫🇷 Français',       bcp47: 'fr-FR' },
    { code: 'de',    name: '🇩🇪 Deutsch',        bcp47: 'de-DE' },
    { code: 'pt',    name: '🇵🇹 Português',      bcp47: 'pt-BR' },
    { code: 'ru',    name: '🇷🇺 Русский',        bcp47: 'ru-RU' },
];

// ─── DOM refs ─────────────────────────────────────────────────
const inputEl          = document.getElementById('input-text');
const translateBtn     = document.getElementById('translate-btn');
const resultArea       = document.getElementById('result-area');
const targetLangSel    = document.getElementById('target-lang');
const charCountEl      = document.getElementById('char-count');
const speakInputBtn    = document.getElementById('speak-input-btn');
const clearBtn         = document.getElementById('clear-btn');
const copyBtn          = document.getElementById('copy-btn');
const speakResultBtn   = document.getElementById('speak-result-btn');
const swapBtn          = document.getElementById('swap-btn');
const detectedBadge    = document.getElementById('detected-badge');
const srcLabelText     = document.getElementById('src-label-text');
const toggleWidgetBtn  = document.getElementById('toggle-widget-btn');
const toggleLabel      = document.getElementById('toggle-label');
const toggleIcon       = document.getElementById('toggle-icon');

// ─── Debounce ────────────────────────────────────────────────
let debounceTimer = null;
function debounce(fn, delay = 600) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fn, delay);
}

// ═════════════════════════════════════════════════════════════
//  INIT
// ═════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
    // Khôi phục ngôn ngữ đã lưu
    const { ft_targetLang } = await chrome.storage.local.get('ft_targetLang');
    if (ft_targetLang) targetLangSel.value = ft_targetLang;

    // Kiểm tra nếu có text từ context menu
    const { ft_contextText } = await chrome.storage.local.get('ft_contextText');
    if (ft_contextText) {
        inputEl.value = ft_contextText;
        updateCharCount();
        await chrome.storage.local.remove('ft_contextText');
        performTranslation();
    }

    inputEl.focus();
    updateResultActions(false);
    console.log('[Popup] Floating AI Translator popup ready');
});

// ═════════════════════════════════════════════════════════════
//  TRANSLATE
// ═════════════════════════════════════════════════════════════
async function performTranslation() {
    const text = inputEl.value.trim();
    const tl   = targetLangSel.value;

    if (!text) {
        resetResult();
        return;
    }

    setResultState('loading', '⟳  Đang dịch...');
    translateBtn.classList.add('loading');
    updateResultActions(false);

    try {
        // Phải dùng template string — URLSearchParams không encode array param đúng
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(tl)}&dt=t&dt=ld&q=${encodeURIComponent(text)}`;
        const res  = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const translated = (data[0] || [])
            .filter(Boolean)
            .map(p => p[0] || '')
            .join('');

        if (translated) {
            setResultState('success', translated);
            updateResultActions(true);

            // Hiện detected language
            const detectedCode = data[2] || '';
            if (detectedCode) {
                const srcLang = LANGUAGES.find(l => l.code === detectedCode);
                const tgtLang = LANGUAGES.find(l => l.code === tl);
                srcLabelText.textContent = srcLang
                    ? srcLang.name.replace(/^[\S]+\s/, '')   // bỏ emoji
                    : detectedCode.toUpperCase();
                detectedBadge.textContent = `🔍 ${srcLang?.name || detectedCode} → ${tgtLang?.name || tl}`;
                detectedBadge.style.display = 'block';
            }
        } else {
            setResultState('error', '⚠ Không thể dịch. Vui lòng thử lại.');
        }
    } catch (err) {
        console.error('[Popup] Translation error:', err);
        setResultState('error', '⚠ Lỗi kết nối! Kiểm tra internet.');
    } finally {
        translateBtn.classList.remove('loading');
    }
}

// ─── Helpers ─────────────────────────────────────────────────
function setResultState(state, text) {
    resultArea.className = state;
    if (state === '') {
        resultArea.innerHTML = '<span class="placeholder-text">Kết quả dịch sẽ hiển thị ở đây...</span>';
    } else {
        resultArea.textContent = text;
    }
}

function resetResult() {
    setResultState('', '');
    detectedBadge.style.display = 'none';
    srcLabelText.textContent = 'Tự động nhận diện';
    updateResultActions(false);
}

function updateResultActions(enabled) {
    copyBtn.disabled        = !enabled;
    speakResultBtn.disabled = !enabled;
}

function updateCharCount() {
    const len = inputEl.value.length;
    charCountEl.textContent = `${len} / 5000`;
    charCountEl.classList.toggle('warn', len > 4700);
}

function getLangBCP47(code) {
    return LANGUAGES.find(l => l.code === code)?.bcp47 || code;
}

// ─── TTS ─────────────────────────────────────────────────────
function speakText(text, bcp47) {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const utt  = new SpeechSynthesisUtterance(text);
    utt.lang   = bcp47 || 'en-US';
    utt.rate   = 0.9;
    utt.pitch  = 1;
    speechSynthesis.speak(utt);
}

// ═════════════════════════════════════════════════════════════
//  EVENT LISTENERS
// ═════════════════════════════════════════════════════════════

// ─── Language change ─────────────────────────────────────────
targetLangSel.addEventListener('change', () => {
    chrome.storage.local.set({ ft_targetLang: targetLangSel.value });
    if (inputEl.value.trim()) performTranslation();
});

// ─── Input events ────────────────────────────────────────────
inputEl.addEventListener('input', () => {
    updateCharCount();
    debounce(() => {
        if (inputEl.value.trim()) performTranslation();
        else resetResult();
    });
});

inputEl.addEventListener('keydown', (e) => {
    // Ctrl+Enter → dịch ngay
    if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        performTranslation();
    }
});

// ─── Translate button ────────────────────────────────────────
translateBtn.addEventListener('click', performTranslation);

// ─── Swap ────────────────────────────────────────────────────
swapBtn.addEventListener('click', async () => {
    if (resultArea.className !== 'success') return;
    const translated = resultArea.textContent.trim();
    if (!translated) return;
    inputEl.value = translated;
    updateCharCount();
    await performTranslation();
});

// ─── Speak input ─────────────────────────────────────────────
speakInputBtn.addEventListener('click', () => {
    const text = inputEl.value.trim();
    if (text) speakText(text, 'en-US');
});

// ─── Clear ───────────────────────────────────────────────────
clearBtn.addEventListener('click', () => {
    inputEl.value = '';
    updateCharCount();
    resetResult();
    inputEl.focus();
});

// ─── Copy result ─────────────────────────────────────────────
copyBtn.addEventListener('click', () => {
    const text = resultArea.textContent.trim();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        const orig = copyBtn.innerHTML;
        copyBtn.innerHTML = '✓ Đã sao chép!';
        copyBtn.style.color = '#2e7d32';
        setTimeout(() => { copyBtn.innerHTML = orig; copyBtn.style.color = ''; }, 2000);
    }).catch(() => {});
});

// ─── Speak result ────────────────────────────────────────────
speakResultBtn.addEventListener('click', () => {
    const text = resultArea.textContent.trim();
    if (text) speakText(text, getLangBCP47(targetLangSel.value));
});

// ─── Toggle widget on active tab ────────────────────────────
toggleWidgetBtn.addEventListener('click', async () => {
    toggleWidgetBtn.disabled = true;
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.id) return;

        const url = tab.url || '';
        if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:')) {
            toggleLabel.textContent = 'Không hỗ trợ';
            setTimeout(() => { toggleLabel.textContent = 'Widget'; }, 2000);
            return;
        }

        chrome.tabs.sendMessage(tab.id, { action: 'toggleWidget' }, (response) => {
            if (chrome.runtime.lastError) {
                toggleLabel.textContent = 'Thử lại';
                setTimeout(() => { toggleLabel.textContent = 'Widget'; }, 2000);
                return;
            }
            const visible = response?.visible;
            toggleIcon.textContent  = visible ? '⊟' : '⊞';
            toggleLabel.textContent = visible ? 'Đang hiện' : 'Đã ẩn';
            setTimeout(() => {
                toggleIcon.textContent  = '⊞';
                toggleLabel.textContent = 'Widget';
            }, 2000);
        });
    } finally {
        setTimeout(() => { toggleWidgetBtn.disabled = false; }, 500);
    }
});
