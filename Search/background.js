chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "quick-mini-search-text",
    title: "Tìm kiếm mini: '%s'",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "quick-mini-search-image",
    title: "Tìm kiếm bằng hình ảnh",
    contexts: ["image"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "quick-mini-search-text") {
    const query = encodeURIComponent(info.selectionText);
    const targetUrl = `https://www.google.com/search?q=${query}`;
    
    chrome.windows.create({
      url: targetUrl,
      type: "popup",
      width: 520,
      height: 720,
      focused: true
    });
  } else if (info.menuItemId === "quick-mini-search-image") {
    const imageUrl = encodeURIComponent(info.srcUrl);
    const targetUrl = `https://lens.google.com/uploadbyurl?url=${imageUrl}`;
    
    chrome.windows.create({
      url: targetUrl,
      type: "popup",
      width: 520,
      height: 720,
      focused: true
    });
  }
});
