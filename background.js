// Hotstar Bypass Extension - Background Service

console.log('🚀 Hotstar Bypass background service loaded');

// ─── INSTALL ───
chrome.runtime.onInstalled.addListener(function(details) {
    console.log('📦 Extension installed:', details.reason);
    
    if (details.reason === 'install') {
        chrome.storage.local.set({
            autoBypass: true,
            showNotification: true,
            defaultProfile: 'auto',
            bypassCount: 0
        });
    }
});

// ─── ICON CLICK ───
chrome.action.onClicked.addListener(function(tab) {
    // Open popup
    chrome.action.openPopup();
});

// ─── TAB UPDATE ───
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url) {
        if (tab.url.includes('hotstar.com') || tab.url.includes('jiocinema.com')) {
            console.log('📺 Hotstar tab detected:', tabId);
            
            // Inject content script if needed
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            }).catch(() => {});
        }
    }
});
