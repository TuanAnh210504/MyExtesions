// Background Service Worker — Floating AI Translator v1.1

chrome.runtime.onInstalled.addListener(() => {
    console.log('✅ Floating AI Translator v1.1 đã được cài đặt');

    // Tạo context menu khi chuột phải vào text đã chọn
    chrome.contextMenus.create({
        id: 'ft-translate-selection',
        title: '🌐 Dịch "%s" với Floating Translator',
        contexts: ['selection']
    });
});

// Context menu click → gửi text đã chọn đến content script
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== 'ft-translate-selection') return;
    if (!info.selectionText) return;
    if (!tab || !tab.id) return;

    // Bỏ qua các trang đặc biệt của Chrome
    const url = tab.url || '';
    if (
        url.startsWith('chrome://') ||
        url.startsWith('chrome-extension://') ||
        url.startsWith('about:') ||
        url.startsWith('edge://')
    ) {
        return;
    }

    // Gửi text đến content script → hiện widget + tự dịch
    chrome.tabs.sendMessage(
        tab.id,
        {
            action: 'translateSelection',
            text: info.selectionText.trim()
        },
        (response) => {
            if (chrome.runtime.lastError) {
                console.warn('[BG] Content script chưa sẵn sàng:', chrome.runtime.lastError.message);
            }
        }
    );
});

// Lắng nghe phím tắt Ctrl+Shift+T → toggle widget
chrome.commands.onCommand.addListener((command, tab) => {
    if (command !== 'toggle-widget') return;
    if (!tab || !tab.id) return;

    const url = tab.url || '';
    if (
        url.startsWith('chrome://') ||
        url.startsWith('chrome-extension://') ||
        url.startsWith('about:')
    ) {
        return;
    }

    chrome.tabs.sendMessage(
        tab.id,
        { action: 'toggleWidget' },
        (response) => {
            if (chrome.runtime.lastError) {
                console.warn('[BG] Không toggle được widget:', chrome.runtime.lastError.message);
            }
        }
    );
});
