// ============================================================
//  Floating AI Translator — Content Script (Shadow DOM)
//  Hoạt động trên mọi trang web kể cả Facebook
// ============================================================
'use strict';

const FT_ROOT_ID       = 'floating-translator-root';
const FT_SEL_ROOT_ID   = 'floating-translator-sel-root';
const MAX_INPUT_LENGTH = 5000;

const LANGUAGES = [
    { code: 'vi',    name: '🇻🇳 Tiếng Việt',      bcp47: 'vi-VN' },
    { code: 'en',    name: '🇺🇸 English',           bcp47: 'en-US' },
    { code: 'zh-CN', name: '🇨🇳 中文 (简体)',        bcp47: 'zh-CN' },
    { code: 'zh-TW', name: '🇹🇼 中文 (繁體)',        bcp47: 'zh-TW' },
    { code: 'ja',    name: '🇯🇵 日本語',             bcp47: 'ja-JP' },
    { code: 'ko',    name: '🇰🇷 한국어',             bcp47: 'ko-KR' },
    { code: 'th',    name: '🇹🇭 ภาษาไทย',           bcp47: 'th-TH' },
    { code: 'es',    name: '🇪🇸 Español',            bcp47: 'es-ES' },
    { code: 'fr',    name: '🇫🇷 Français',           bcp47: 'fr-FR' },
    { code: 'de',    name: '🇩🇪 Deutsch',            bcp47: 'de-DE' },
    { code: 'pt',    name: '🇵🇹 Português',          bcp47: 'pt-BR' },
    { code: 'ru',    name: '🇷🇺 Русский',            bcp47: 'ru-RU' },
];

// ─── State ───────────────────────────────────────────────────
let shadow       = null;
let widgetEl     = null;
let selBtn       = null;
let selBtnRoot   = null;

let isVisible    = false;
let isPinned     = false;
let isMinimized  = false;
let isDragging   = false;
let dragOffset   = { x: 0, y: 0 };
let debounceTimer = null;

// ═════════════════════════════════════════════════════════════
//  BOOT
// ═════════════════════════════════════════════════════════════
function boot() {
    // Tránh khởi tạo nhiều lần
    if (document.getElementById(FT_ROOT_ID)) return;

    chrome.storage.local.get(
        ['ft_pinned', 'ft_minimized', 'ft_targetLang', 'ft_position'],
        (data) => {
            isPinned    = !!data.ft_pinned;
            isMinimized = !!data.ft_minimized;

            createWidget(data);
            createSelectionButton();
            setupSelectionListener();
            setupMessageListener();
        }
    );
}

// ═════════════════════════════════════════════════════════════
//  WIDGET — TẠO SHADOW DOM
// ═════════════════════════════════════════════════════════════
function createWidget(savedData) {
    const host = document.createElement('div');
    host.id = FT_ROOT_ID;
    // Phủ full viewport để tránh bị ảnh hưởng bởi CSS transform của trang (Facebook, v.v.)
    // position:fixed bên trong Shadow DOM sẽ tính tương đối với viewport,
    // nhưng nếu trang có CSS transform thì bị lệch — dùng host phủ full màn hình + position:absolute bên trong
    host.style.cssText = `
        all: initial !important;
        position: fixed !important;
        top: 0 !important; left: 0 !important;
        right: 0 !important; bottom: 0 !important;
        z-index: 2147483647 !important;
        pointer-events: none !important;
        display: block !important;
    `;
    document.body.appendChild(host);

    shadow = host.attachShadow({ mode: 'open' });

    const styleEl = document.createElement('style');
    styleEl.textContent = WIDGET_CSS;
    shadow.appendChild(styleEl);

    widgetEl = document.createElement('div');
    widgetEl.id = 'ft-widget';
    widgetEl.innerHTML = buildWidgetHTML();
    // CSS đã có display:none mặc định — không cần inline style
    shadow.appendChild(widgetEl);

    // Khôi phục vị trí đã lưu
    if (savedData.ft_position) {
        const { top, left } = savedData.ft_position;
        if (top)  widgetEl.style.top  = top;
        if (left) { widgetEl.style.left = left; widgetEl.style.right = 'auto'; }
    }

    // Khôi phục ngôn ngữ
    if (savedData.ft_targetLang) {
        const sel = shadow.getElementById('ft-target-lang');
        if (sel) sel.value = savedData.ft_targetLang;
    }

    // Khôi phục trạng thái pin / minimize
    if (isPinned) {
        shadow.getElementById('ft-pin-btn').classList.add('active');
    }
    if (isMinimized) {
        shadow.getElementById('ft-body').classList.add('collapsed');
        shadow.getElementById('ft-min-btn').textContent = '+';
    }

    setupWidgetEvents();
    console.log('✅ [Floating Translator] Widget sẵn sàng (Shadow DOM)');
}

// ─── Build HTML ───────────────────────────────────────────────
function buildWidgetHTML() {
    const langOptions = LANGUAGES
        .map(l => `<option value="${l.code}">${l.name}</option>`)
        .join('');

    return `
        <div id="ft-header">
            <div id="ft-header-left">
                <span id="ft-icon">🌐</span>
                <span id="ft-title">Dịch Thuật</span>
            </div>
            <div id="ft-header-btns">
                <button id="ft-pin-btn"   title="Ghim widget">📌</button>
                <button id="ft-min-btn"   title="Thu gọn">−</button>
                <button id="ft-close-btn" title="Đóng">✕</button>
            </div>
        </div>

        <div id="ft-body">
            <!-- Language Row -->
            <div id="ft-lang-row">
                <div id="ft-src-wrap">
                    <span id="ft-src-label">Tự động</span>
                </div>
                <button id="ft-swap-btn" title="Đổi chiều dịch">⇄</button>
                <select id="ft-target-lang">${langOptions}</select>
            </div>

            <!-- Detected language badge -->
            <div id="ft-detected" style="display:none"></div>

            <!-- Input -->
            <div id="ft-input-wrap">
                <textarea
                    id="ft-input"
                    placeholder="Nhập văn bản hoặc bôi đen chữ trên trang để dịch..."
                    maxlength="5000"
                    rows="3"
                ></textarea>
                <span id="ft-char">0 / 5000</span>
            </div>

            <!-- Action row -->
            <div id="ft-action-row">
                <button id="ft-translate-btn">📝 Dịch</button>
                <button id="ft-speak-input-btn" title="Phát âm văn bản gốc">🔊</button>
                <button id="ft-clear-btn"       title="Xóa nội dung">🗑</button>
            </div>

            <!-- Result -->
            <div id="ft-result-area">
                <span class="ft-placeholder">Kết quả dịch sẽ hiển thị ở đây...</span>
            </div>

            <!-- Result actions -->
            <div id="ft-result-row">
                <button id="ft-copy-btn"         disabled>📋 Sao chép</button>
                <button id="ft-speak-result-btn" disabled>🔊 Phát âm</button>
            </div>

            <!-- Toggle widget on page button (from popup) -->
            <div id="ft-footer">
                <span id="ft-shortcut-hint">Phím tắt: Ctrl+Shift+T</span>
            </div>
        </div>
    `;
}

// ─── CSS bên trong Shadow DOM ─────────────────────────────────
const WIDGET_CSS = `
/* Reset cứng — không bị trang chủ override */
:host { all: initial; }
* { box-sizing: border-box; margin: 0; padding: 0; }
button { font-family: inherit; }
textarea { font-family: inherit; }

/* ── Widget container ── */
/* Dùng position:absolute thay vì fixed vì host đã phủ full viewport.
   Tránh được vấn đề CSS transform của trang phá vỡ position:fixed */
#ft-widget {
    position: absolute;
    top: 60px;
    right: 20px;
    width: 355px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.18), 0 2px 10px rgba(0,0,0,0.08);
    border: 1px solid rgba(0,0,0,0.07);
    font-family: 'Segoe UI', 'Arial', sans-serif;
    font-size: 14px;
    display: none;           /* Ẩn mặc định — JS dùng class .ft-visible để hiện */
    flex-direction: column;
    overflow: hidden;
    transition: box-shadow 0.25s ease;
    pointer-events: auto;    /* auto thay vì all (all không hợp lệ với HTML elements) */
}
#ft-widget.ft-visible {
    display: flex !important;
}
#ft-widget:hover {
    box-shadow: 0 12px 48px rgba(0,0,0,0.22), 0 2px 10px rgba(0,0,0,0.1);
}

/* ── Header ── */
#ft-header {
    padding: 10px 14px;
    background: linear-gradient(135deg, #0d47a1 0%, #1976D2 45%, #42a5f5 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: move;
    user-select: none;
    gap: 8px;
}
#ft-header-left {
    display: flex;
    align-items: center;
    gap: 7px;
}
#ft-icon   { font-size: 17px; }
#ft-title  { font-weight: 700; font-size: 13.5px; letter-spacing: 0.2px; }
#ft-header-btns { display: flex; gap: 5px; }
#ft-header button {
    background: rgba(255,255,255,0.18);
    border: 1px solid rgba(255,255,255,0.18);
    color: white;
    width: 27px; height: 27px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 13px;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s, transform 0.1s;
    padding: 0;
}
#ft-header button:hover {
    background: rgba(255,255,255,0.32);
    transform: scale(1.12);
}
#ft-pin-btn.active {
    background: rgba(255,255,255,0.42);
    box-shadow: 0 0 0 2px rgba(255,255,255,0.35);
}
#ft-close-btn:hover { background: rgba(220,53,69,0.7) !important; }

/* ── Body ── */
#ft-body {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 9px;
    background: #f8f9fc;
}
#ft-body.collapsed { display: none; }

/* ── Language row ── */
#ft-lang-row {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #fff;
    border: 1.5px solid #e3e8f0;
    border-radius: 10px;
    padding: 6px 10px;
}
#ft-src-wrap {
    flex: 1;
    text-align: center;
}
#ft-src-label {
    font-size: 12px;
    color: #555;
    font-weight: 600;
}
#ft-swap-btn {
    background: #e3f0ff;
    border: none;
    color: #1565C0;
    width: 30px; height: 30px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 15px;
    font-weight: bold;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: background 0.2s, transform 0.3s;
}
#ft-swap-btn:hover {
    background: #bbdefb;
    transform: rotate(180deg);
}
#ft-target-lang {
    flex: 1;
    padding: 4px 2px;
    border: none;
    font-size: 12px;
    font-weight: 600;
    background: transparent;
    cursor: pointer;
    color: #1565C0;
    outline: none;
}

/* ── Detected badge ── */
#ft-detected {
    font-size: 11.5px;
    color: #546e7a;
    background: #eceff1;
    border-radius: 6px;
    padding: 4px 9px;
    border: 1px solid #cfd8dc;
    text-align: center;
}

/* ── Input ── */
#ft-input-wrap { position: relative; }
#ft-input {
    width: 100%;
    min-height: 72px;
    max-height: 130px;
    padding: 9px 11px 22px 11px;
    border: 1.5px solid #dde3ee;
    border-radius: 10px;
    font-size: 13px;
    line-height: 1.55;
    resize: vertical;
    background: #fff;
    color: #222;
    transition: border-color 0.2s, box-shadow 0.2s;
    display: block;
}
#ft-input:focus {
    outline: none;
    border-color: #2196F3;
    box-shadow: 0 0 0 3px rgba(33,150,243,0.12);
}
#ft-char {
    position: absolute;
    bottom: 6px; right: 9px;
    font-size: 10px;
    color: #bbb;
    pointer-events: none;
    user-select: none;
}
#ft-char.warn { color: #f44336; }

/* ── Action row ── */
#ft-action-row { display: flex; gap: 6px; }
#ft-translate-btn {
    flex: 1;
    padding: 8px 12px;
    background: linear-gradient(135deg, #1565C0, #2196F3);
    color: #fff;
    border: none;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.2px;
}
#ft-translate-btn:hover {
    background: linear-gradient(135deg, #0d47a1, #1565C0);
    box-shadow: 0 4px 14px rgba(33,150,243,0.4);
    transform: translateY(-1px);
}
#ft-translate-btn:active { transform: translateY(0); }
#ft-translate-btn.loading {
    background: #90a4ae;
    cursor: not-allowed;
}
#ft-speak-input-btn, #ft-clear-btn {
    width: 38px; height: 38px;
    border: 1.5px solid #dde3ee;
    border-radius: 9px;
    background: #fff;
    cursor: pointer;
    font-size: 15px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
}
#ft-speak-input-btn:hover { border-color: #FF9800; background: #fff8e1; }
#ft-clear-btn:hover        { border-color: #ef5350; background: #ffebee; }

/* ── Result area ── */
#ft-result-area {
    min-height: 60px;
    max-height: 170px;
    padding: 10px 12px;
    background: #fff;
    border: 1.5px solid #dde3ee;
    border-radius: 10px;
    font-size: 13.5px;
    line-height: 1.65;
    color: #333;
    overflow-y: auto;
    word-break: break-word;
    transition: border-color 0.2s, background 0.2s;
}
#ft-result-area .ft-placeholder { color: #b0bec5; font-style: italic; }
#ft-result-area.loading {
    color: #78909c;
    font-style: italic;
    animation: ft-pulse 1.4s ease-in-out infinite;
}
#ft-result-area.error   { color: #b71c1c; background: #fff3f3; border-color: #ef9a9a; }
#ft-result-area.success { color: #0d2f6e; background: #eaf5ff; border-color: #90caf9; font-style: normal; }
@keyframes ft-pulse {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.45; }
}
#ft-result-area::-webkit-scrollbar { width: 4px; }
#ft-result-area::-webkit-scrollbar-track { background: transparent; }
#ft-result-area::-webkit-scrollbar-thumb { background: #cfd8dc; border-radius: 2px; }

/* ── Result row ── */
#ft-result-row { display: flex; gap: 6px; }
#ft-copy-btn, #ft-speak-result-btn {
    flex: 1;
    padding: 7px;
    border: 1.5px solid #dde3ee;
    background: #fff;
    color: #546e7a;
    border-radius: 9px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    gap: 4px;
    transition: all 0.2s;
}
#ft-copy-btn:hover:not(:disabled) {
    border-color: #2196F3; color: #2196F3; background: #e3f2fd;
}
#ft-speak-result-btn:hover:not(:disabled) {
    border-color: #FF9800; color: #FF9800; background: #fff8e1;
}
#ft-copy-btn:disabled, #ft-speak-result-btn:disabled { opacity: 0.38; cursor: not-allowed; }

/* ── Footer hint ── */
#ft-footer {
    text-align: center;
    padding-top: 2px;
}
#ft-shortcut-hint {
    font-size: 10.5px;
    color: #b0bec5;
}
`;

// ═════════════════════════════════════════════════════════════
//  WIDGET EVENTS
// ═════════════════════════════════════════════════════════════
function setupWidgetEvents() {
    const header          = shadow.getElementById('ft-header');
    const pinBtn          = shadow.getElementById('ft-pin-btn');
    const minBtn          = shadow.getElementById('ft-min-btn');
    const closeBtn        = shadow.getElementById('ft-close-btn');
    const body            = shadow.getElementById('ft-body');
    const swapBtn         = shadow.getElementById('ft-swap-btn');
    const targetLangSel   = shadow.getElementById('ft-target-lang');
    const inputEl         = shadow.getElementById('ft-input');
    const charEl          = shadow.getElementById('ft-char');
    const translateBtn    = shadow.getElementById('ft-translate-btn');
    const speakInputBtn   = shadow.getElementById('ft-speak-input-btn');
    const clearBtn        = shadow.getElementById('ft-clear-btn');
    const resultArea      = shadow.getElementById('ft-result-area');
    const copyBtn         = shadow.getElementById('ft-copy-btn');
    const speakResultBtn  = shadow.getElementById('ft-speak-result-btn');
    const detectedBadge   = shadow.getElementById('ft-detected');
    const srcLabel        = shadow.getElementById('ft-src-label');

    // ─── Drag ───────────────────────────────────────────────
    header.addEventListener('mousedown', (e) => {
        const id = e.target.id;
        if (id === 'ft-pin-btn' || id === 'ft-min-btn' || id === 'ft-close-btn') return;
        isDragging = true;
        const rect = widgetEl.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
        header.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const x = e.clientX - dragOffset.x;
        const y = e.clientY - dragOffset.y;
        const maxX = window.innerWidth  - widgetEl.offsetWidth;
        const maxY = window.innerHeight - widgetEl.offsetHeight;
        widgetEl.style.left  = Math.max(0, Math.min(x, maxX)) + 'px';
        widgetEl.style.top   = Math.max(0, Math.min(y, maxY)) + 'px';
        widgetEl.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        header.style.cursor = 'move';
        // Lưu vị trí
        chrome.storage.local.set({
            ft_position: { top: widgetEl.style.top, left: widgetEl.style.left }
        });
    });

    // ─── Pin ────────────────────────────────────────────────
    pinBtn.addEventListener('click', () => {
        isPinned = !isPinned;
        pinBtn.classList.toggle('active', isPinned);
        pinBtn.title = isPinned ? 'Bỏ ghim' : 'Ghim widget';
        chrome.storage.local.set({ ft_pinned: isPinned });
    });

    // ─── Minimize ───────────────────────────────────────────
    minBtn.addEventListener('click', () => {
        isMinimized = !isMinimized;
        body.classList.toggle('collapsed', isMinimized);
        minBtn.textContent = isMinimized ? '+' : '−';
        chrome.storage.local.set({ ft_minimized: isMinimized });
    });

    // ─── Close ──────────────────────────────────────────────
    closeBtn.addEventListener('click', () => hideWidget());

    // ─── Swap languages ─────────────────────────────────────
    swapBtn.addEventListener('click', async () => {
        if (!resultArea.classList.contains('success')) return;
        const translated = resultArea.textContent.trim();
        if (!translated) return;
        inputEl.value = translated;
        updateCharCount();
        await performTranslation();
    });

    // ─── Language change ────────────────────────────────────
    targetLangSel.addEventListener('change', () => {
        chrome.storage.local.set({ ft_targetLang: targetLangSel.value });
        if (inputEl.value.trim()) performTranslation();
    });

    // ─── Input & char counter ───────────────────────────────
    inputEl.addEventListener('input', () => {
        updateCharCount();
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (inputEl.value.trim()) performTranslation();
        }, 600);
    });

    // ─── Translate button ───────────────────────────────────
    translateBtn.addEventListener('click', () => performTranslation());

    // ─── Speak input ────────────────────────────────────────
    speakInputBtn.addEventListener('click', () => {
        const text = inputEl.value.trim();
        if (text) speakText(text, 'en-US'); // TTS với ngôn ngữ mặc định (auto detect ko có BCP47)
    });

    // ─── Clear ──────────────────────────────────────────────
    clearBtn.addEventListener('click', () => {
        inputEl.value = '';
        updateCharCount();
        setResult('placeholder', 'Kết quả dịch sẽ hiển thị ở đây...');
        copyBtn.disabled = true;
        speakResultBtn.disabled = true;
        detectedBadge.style.display = 'none';
        srcLabel.textContent = 'Tự động';
    });

    // ─── Copy result ─────────────────────────────────────────
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

    // ─── Speak result ────────────────────────────────────────
    speakResultBtn.addEventListener('click', () => {
        const text = resultArea.textContent.trim();
        const lang = targetLangSel.value;
        if (text) speakText(text, getLangBCP47(lang));
    });

    // ─── Helper: update char count ───────────────────────────
    function updateCharCount() {
        const len = inputEl.value.length;
        charEl.textContent = `${len} / ${MAX_INPUT_LENGTH}`;
        charEl.classList.toggle('warn', len > MAX_INPUT_LENGTH - 300);
    }
}

// ─── Char counter helper (dùng từ ngoài events) ──────────────
function updateCharCount() {
    if (!shadow) return;
    const inputEl = shadow.getElementById('ft-input');
    const charEl  = shadow.getElementById('ft-char');
    if (!inputEl || !charEl) return;
    const len = inputEl.value.length;
    charEl.textContent = `${len} / ${MAX_INPUT_LENGTH}`;
    charEl.classList.toggle('warn', len > MAX_INPUT_LENGTH - 300);
}

// ─── Set result state ─────────────────────────────────────────
function setResult(state, text) {
    const resultArea = shadow.getElementById('ft-result-area');
    if (!resultArea) return;
    resultArea.className = state;
    if (state === 'placeholder') {
        resultArea.innerHTML = `<span class="ft-placeholder">${text}</span>`;
    } else {
        resultArea.textContent = text;
    }
}

// ═════════════════════════════════════════════════════════════
//  TRANSLATION LOGIC
// ═════════════════════════════════════════════════════════════
async function performTranslation() {
    const inputEl         = shadow.getElementById('ft-input');
    const targetLangSel   = shadow.getElementById('ft-target-lang');
    const resultArea      = shadow.getElementById('ft-result-area');
    const copyBtn         = shadow.getElementById('ft-copy-btn');
    const speakResultBtn  = shadow.getElementById('ft-speak-result-btn');
    const detectedBadge   = shadow.getElementById('ft-detected');
    const srcLabel        = shadow.getElementById('ft-src-label');
    const translateBtn    = shadow.getElementById('ft-translate-btn');

    const text = inputEl.value.trim();
    const tl   = targetLangSel.value;

    if (!text) {
        setResult('placeholder', 'Kết quả dịch sẽ hiển thị ở đây...');
        if (copyBtn) copyBtn.disabled = true;
        if (speakResultBtn) speakResultBtn.disabled = true;
        if (detectedBadge) detectedBadge.style.display = 'none';
        return;
    }

    setResult('loading', '⟳  Đang dịch...');
    if (translateBtn) translateBtn.classList.add('loading');
    if (copyBtn) copyBtn.disabled = true;
    if (speakResultBtn) speakResultBtn.disabled = true;

    try {
        // Phải dùng template string — URLSearchParams không encode array param đúng
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(tl)}&dt=t&dt=ld&q=${encodeURIComponent(text)}`;
        const res  = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Ghép tất cả phần dịch lại
        const translated = (data[0] || [])
            .filter(Boolean)
            .map(part => part[0] || '')
            .join('');

        if (translated) {
            setResult('success', translated);
            if (copyBtn) copyBtn.disabled = false;
            if (speakResultBtn) speakResultBtn.disabled = false;

            // Hiện ngôn ngữ đã nhận diện
            const detectedCode = data[2] || '';
            if (detectedCode && detectedBadge && srcLabel) {
                const detectedLang = LANGUAGES.find(l => l.code === detectedCode);
                const targetLang   = LANGUAGES.find(l => l.code === tl);
                const srcName  = detectedLang ? detectedLang.name : detectedCode.toUpperCase();
                const tgtName  = targetLang   ? targetLang.name   : tl.toUpperCase();
                srcLabel.textContent = detectedLang
                    ? detectedLang.name.replace(/^[\S]+\s/, '')  // bỏ emoji
                    : detectedCode;
                detectedBadge.textContent = `🔍 Phát hiện: ${srcName} → ${tgtName}`;
                detectedBadge.style.display = 'block';
            }
        } else {
            setResult('error', '⚠ Không thể dịch. Vui lòng thử lại.');
        }
    } catch (err) {
        console.error('[Floating Translator]', err);
        setResult('error', '⚠ Lỗi kết nối! Kiểm tra internet.');
    } finally {
        if (translateBtn) translateBtn.classList.remove('loading');
    }
}

// ─── Text-to-Speech ──────────────────────────────────────────
function speakText(text, bcp47Lang) {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang  = bcp47Lang || 'en-US';
    utterance.rate  = 0.9;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
}

function getLangBCP47(code) {
    const lang = LANGUAGES.find(l => l.code === code);
    return lang ? lang.bcp47 : code;
}

// ═════════════════════════════════════════════════════════════
//  WIDGET VISIBILITY — dùng CSS class thay vì inline style
//  để tránh conflict với CSS specificity trong Shadow DOM
// ═════════════════════════════════════════════════════════════
function showWidget() {
    if (!widgetEl) return;
    widgetEl.classList.add('ft-visible');    // CSS: display:flex !important
    isVisible = true;
    console.log('[FT] Widget shown');
}

function hideWidget() {
    if (!widgetEl || isPinned) return;
    widgetEl.classList.remove('ft-visible');
    isVisible = false;
    console.log('[FT] Widget hidden');
}

function toggleWidget() {
    if (isVisible) hideWidget();
    else showWidget();
}

// Điền text vào widget, mở widget, và tự dịch
function fillAndTranslate(text) {
    showWidget();

    // Mở nếu đang thu gọn
    if (isMinimized) {
        isMinimized = false;
        const body   = shadow.getElementById('ft-body');
        const minBtn = shadow.getElementById('ft-min-btn');
        if (body)   body.classList.remove('collapsed');
        if (minBtn) minBtn.textContent = '−';
    }

    const inputEl = shadow.getElementById('ft-input');
    if (inputEl) {
        inputEl.value = text;
        updateCharCount();
        clearTimeout(debounceTimer);
        performTranslation();
    }
}

// ═════════════════════════════════════════════════════════════
//  SELECTION MINI BUTTON
// ═════════════════════════════════════════════════════════════
function createSelectionButton() {
    const selHost = document.createElement('div');
    selHost.id = FT_SEL_ROOT_ID;
    selHost.style.cssText = `
        all: initial !important;
        position: fixed !important;
        top: 0 !important; left: 0 !important;
        z-index: 2147483646 !important;
        pointer-events: none !important;
        display: block !important;
    `;
    document.body.appendChild(selHost);

    const selShadow = selHost.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
        #ft-sel-btn {
            position: fixed;
            background: linear-gradient(135deg, #1565C0, #42a5f5);
            color: white;
            border: none;
            border-radius: 20px;
            padding: 5px 13px;
            font-size: 12px;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 3px 14px rgba(21,101,192,0.45);
            pointer-events: all;
            transition: all 0.15s;
            display: none;
            align-items: center;
            gap: 5px;
            white-space: nowrap;
            letter-spacing: 0.2px;
            user-select: none;
        }
        #ft-sel-btn:hover {
            background: linear-gradient(135deg, #0d47a1, #1565C0);
            transform: scale(1.06);
            box-shadow: 0 5px 18px rgba(21,101,192,0.55);
        }
        #ft-sel-btn:active { transform: scale(0.97); }
    `;
    selShadow.appendChild(style);

    selBtn = document.createElement('button');
    selBtn.id = 'ft-sel-btn';
    selBtn.innerHTML = '🌐 Dịch';
    selShadow.appendChild(selBtn);

    // mousedown: ngăn document.mousedown ẩn button VÀ ngăn mất selection
    selBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();      // Giữ nguyên text selection khi click button
        e.stopPropagation();     // Ngăn document.mousedown listener chạy
    });

    selBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Lấy text trước khi ẩn button (selection vẫn còn nhờ preventDefault trên mousedown)
        const selectedText = window.getSelection()?.toString().trim() || '';
        selBtn.style.display = 'none';
        if (selectedText) {
            fillAndTranslate(selectedText);
        }
    });
}

function setupSelectionListener() {
    // Hiện nút khi bôi đen text
    document.addEventListener('mouseup', (e) => {
        // Không phải click vào selection button
        if (!selBtn) return;

        setTimeout(() => {
            const sel  = window.getSelection();
            const text = sel ? sel.toString().trim() : '';

            if (text.length > 1 && text.length <= MAX_INPUT_LENGTH) {
                try {
                    const range = sel.getRangeAt(0);
                    const rect  = range.getBoundingClientRect();

                    if (rect.width > 0 || rect.height > 0) {
                        const btnW = 90;
                        const btnX = rect.left + rect.width / 2 - btnW / 2;
                        const btnY = rect.top - 42;

                        selBtn.style.left    = Math.max(6, Math.min(btnX, window.innerWidth - btnW - 6)) + 'px';
                        selBtn.style.top     = Math.max(6, btnY) + 'px';
                        selBtn.style.display = 'flex';
                    }
                } catch (err) {
                    // getRangeAt có thể throw nếu selection bị xóa nhanh
                }
            } else {
                selBtn.style.display = 'none';
            }
        }, 10);
    });

    // Ẩn nút khi click ra ngoài
    document.addEventListener('mousedown', () => {
        if (selBtn) selBtn.style.display = 'none';
    });

    // Ẩn nút khi cuộn trang
    document.addEventListener('scroll', () => {
        if (selBtn) selBtn.style.display = 'none';
    }, { passive: true });
}

// ═════════════════════════════════════════════════════════════
//  MESSAGE LISTENER (từ background.js)
// ═════════════════════════════════════════════════════════════
function setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
        try {
            switch (request.action) {
                case 'toggleWidget':
                    toggleWidget();
                    sendResponse({ success: true, visible: isVisible });
                    break;

                case 'translateSelection':
                    if (request.text) fillAndTranslate(request.text);
                    sendResponse({ success: true });
                    break;

                case 'showWidget':
                    showWidget();
                    sendResponse({ success: true });
                    break;

                case 'hideWidget':
                    hideWidget();
                    sendResponse({ success: true });
                    break;

                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (err) {
            console.error('[Floating Translator] Message error:', err);
            sendResponse({ success: false, error: err.message });
        }
        return true; // giữ message channel mở cho async
    });
}

// ═════════════════════════════════════════════════════════════
//  KHỞI ĐỘNG
// ═════════════════════════════════════════════════════════════
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
