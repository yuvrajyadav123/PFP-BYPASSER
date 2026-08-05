// Hotstar Bypass Extension - Popup Controls

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Hotstar Bypass Popup loaded');

    const bypassBtn = document.getElementById('bypassBtn');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const autoBypass = document.getElementById('autoBypass');
    const showNotification = document.getElementById('showNotification');
    const profileSelect = document.getElementById('profileSelect');

    // ─── QUICK ACTION BUTTONS ───
    const quickBtns = document.querySelectorAll('.quick-btn');
    quickBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            handleQuickAction(action);
        });
    });

    // ─── BYPASS BUTTON ───
    bypassBtn.addEventListener('click', function() {
        console.log('⚡ Bypass button clicked');
        performBypass();
    });

    // ─── HANDLE QUICK ACTION ───
    function handleQuickAction(action) {
        console.log('⚡ Quick action:', action);
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (!tabs[0] || !tabs[0].url) {
                showNotification('❌ No active tab found', 'error');
                return;
            }
            
            chrome.tabs.sendMessage(tabs[0].id, {
                action: action
            }, function(response) {
                if (chrome.runtime.lastError) {
                    showNotification('❌ Please refresh Hotstar page', 'error');
                    return;
                }
                if (response && response.success) {
                    showNotification('✅ ' + response.message, 'success');
                } else {
                    showNotification('❌ Action failed', 'error');
                }
            });
        });
    }

    // ─── PERFORM BYPASS ───
    function performBypass() {
        bypassBtn.textContent = '⏳ Bypassing...';
        bypassBtn.disabled = true;
        bypassBtn.classList.remove('success', 'error');

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (!tabs[0] || !tabs[0].url) {
                showNotification('❌ No active tab found', 'error');
                resetButton();
                return;
            }

            // Check if it's Hotstar or JioCinema
            const url = tabs[0].url;
            if (!url.includes('hotstar.com') && !url.includes('jiocinema.com')) {
                showNotification('❌ Open Hotstar or JioCinema first', 'error');
                resetButton();
                return;
            }

            // Send bypass command
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'bypass',
                profile: profileSelect.value
            }, function(response) {
                if (chrome.runtime.lastError) {
                    showNotification('❌ Please refresh the page', 'error');
                    resetButton();
                    return;
                }
                
                if (response && response.success) {
                    bypassBtn.classList.add('success');
                    showNotification('✅ Profile bypassed!', 'success');
                    updateStatus(true, 'Bypassed');
                } else {
                    bypassBtn.classList.add('error');
                    showNotification('❌ Bypass failed - try refreshing', 'error');
                    updateStatus(false, 'Error');
                }
                resetButton();
            });
        });
    }

    // ─── RESET BUTTON ───
    function resetButton() {
        setTimeout(() => {
            bypassBtn.textContent = '⚡ Bypass Profile Screen';
            bypassBtn.disabled = false;
            bypassBtn.classList.remove('success', 'error');
            updateStatus(true, 'Ready');
        }, 1500);
    }

    // ─── UPDATE STATUS ───
    function updateStatus(active, text) {
        if (statusDot) {
            statusDot.className = 'dot ' + (active ? 'active' : 'inactive');
        }
        if (statusText) {
            statusText.textContent = text || (active ? 'Ready' : 'Offline');
        }
    }

    // ─── SHOW NOTIFICATION ───
    function showNotification(message, type) {
        // Check if notification is enabled
        if (!document.getElementById('showNotification').checked) {
            return;
        }

        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notif = document.createElement('div');
        notif.className = 'notification ' + (type || '');
        notif.textContent = message;
        document.body.appendChild(notif);

        setTimeout(() => {
            notif.style.opacity = '0';
            notif.style.transition = 'opacity 0.3s';
            setTimeout(() => notif.remove(), 300);
        }, 2000);
    }

    // ─── LOAD SETTINGS ───
    chrome.storage.local.get(['autoBypass', 'showNotification', 'defaultProfile'], function(data) {
        if (data.autoBypass !== undefined) {
            document.getElementById('autoBypass').checked = data.autoBypass;
        }
        if (data.showNotification !== undefined) {
            document.getElementById('showNotification').checked = data.showNotification;
        }
        if (data.defaultProfile) {
            document.getElementById('profileSelect').value = data.defaultProfile;
        }
    });

    // ─── SAVE SETTINGS ───
    autoBypass.addEventListener('change', function() {
        chrome.storage.local.set({ autoBypass: this.checked });
    });

    showNotification.addEventListener('change', function() {
        chrome.storage.local.set({ showNotification: this.checked });
    });

    profileSelect.addEventListener('change', function() {
        chrome.storage.local.set({ defaultProfile: this.value });
    });

    // ─── CHECK TAB STATUS ───
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0] && tabs[0].url) {
            const url = tabs[0].url;
            if (url.includes('hotstar.com') || url.includes('jiocinema.com')) {
                updateStatus(true, 'Hotstar Detected');
            } else {
                updateStatus(false, 'Open Hotstar');
            }
        }
    });

    console.log('✅ Popup ready');
});
