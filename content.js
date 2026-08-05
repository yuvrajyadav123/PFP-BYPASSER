// Hotstar Bypass Extension - Content Script
// ✅ Automatically bypasses profile selection

console.log('🚀 Hotstar Bypass content script loaded');

let isBypassed = false;
let profileSelected = false;

// ─── BYPASS FUNCTION ───
function bypassProfile(profileType) {
    console.log('⚡ Attempting to bypass profile...');

    // Method 1: Set Cookies
    setBypassCookies();

    // Method 2: Set Storage
    setBypassStorage();

    // Method 3: Click Profile
    const clicked = clickProfile(profileType);

    // Method 4: Hide Container
    hideProfileContainer();

    // Method 5: Remove Overlay
    removeOverlays();

    if (clicked) {
        isBypassed = true;
        return { success: true, message: 'Profile selected and bypassed' };
    } else {
        return { success: false, message: 'No profile found to select' };
    }
}

// ─── SET BYPASS COOKIES ───
function setBypassCookies() {
    const cookies = [
        'profileSelected=true; path=/; domain=.hotstar.com',
        'skipProfileSelection=true; path=/; domain=.hotstar.com',
        'autoSelectProfile=true; path=/; domain=.hotstar.com',
        'defaultProfile=Adult; path=/; domain=.hotstar.com'
    ];
    
    cookies.forEach(cookie => {
        document.cookie = cookie;
    });
    console.log('🍪 Bypass cookies set');
}

// ─── SET BYPASS STORAGE ───
function setBypassStorage() {
    try {
        localStorage.setItem('profileSelected', 'true');
        localStorage.setItem('skipProfile', 'true');
        localStorage.setItem('autoSelect', 'true');
        localStorage.setItem('profileBypass', 'enabled');
        
        sessionStorage.setItem('profileSelected', 'true');
        sessionStorage.setItem('skipProfileSelection', 'true');
        console.log('💾 Bypass storage set');
    } catch (e) {
        // Storage may not be available
    }
}

// ─── CLICK PROFILE ───
function clickProfile(profileType) {
    // Find all profile elements
    const selectors = [
        '[data-testid="profile-item"]',
        '.profile-item',
        '.profile-card',
        '[role="button"]',
        '.profile-selector .avatar',
        '.profile-container .profile',
        '.profile-option'
    ];

    let profiles = [];
    for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            profiles = profiles.concat(Array.from(elements));
        }
    }

    if (profiles.length === 0) {
        console.log('⚠️ No profiles found');
        return false;
    }

    console.log('👤 Found', profiles.length, 'profiles');

    // Select based on type
    let targetProfile = null;

    if (profileType === 'kids') {
        targetProfile = profiles.find(p => 
            p.textContent.toLowerCase().includes('kids') ||
            p.textContent.toLowerCase().includes('child')
        );
    } else if (profileType === 'adult') {
        targetProfile = profiles.find(p => 
            !p.textContent.toLowerCase().includes('kids') &&
            !p.textContent.toLowerCase().includes('child')
        );
    } else if (profileType === 'first') {
        targetProfile = profiles[0];
    } else {
        // Auto: prefer non-kids profile
        targetProfile = profiles.find(p => 
            !p.textContent.toLowerCase().includes('kids') &&
            !p.textContent.toLowerCase().includes('child')
        ) || profiles[0];
    }

    if (targetProfile) {
        targetProfile.click();
        profileSelected = true;
        console.log('✅ Profile clicked:', targetProfile.textContent.trim() || 'Unnamed');
        return true;
    }

    return false;
}

// ─── HIDE PROFILE CONTAINER ───
function hideProfileContainer() {
    const containers = document.querySelectorAll([
        '.profile-selector-container',
        '.profile-container',
        '[data-testid="profile-selector"]',
        '.profile-selector',
        '.modal-content'
    ].join(','));

    containers.forEach(container => {
        container.style.display = 'none';
        container.style.visibility = 'hidden';
        container.style.opacity = '0';
        container.style.pointerEvents = 'none';
    });
    console.log('📦 Profile containers hidden');
}

// ─── REMOVE OVERLAYS ───
function removeOverlays() {
    const overlays = document.querySelectorAll([
        '.overlay',
        '.modal-overlay',
        '.profile-overlay',
        '.backdrop',
        '.modal-backdrop'
    ].join(','));

    overlays.forEach(overlay => {
        overlay.style.display = 'none';
        overlay.style.visibility = 'hidden';
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
    });
    console.log('📦 Overlays removed');
}

// ─── CREATE NEW PROFILE ───
function createNewProfile(profileName) {
    console.log('➕ Creating new profile:', profileName);
    
    // Find add profile button
    const addBtn = document.querySelector('[data-testid="add-profile"]') ||
                   document.querySelector('.add-profile') ||
                   document.querySelector('button:contains("Add")');
    
    if (addBtn) {
        addBtn.click();
        
        // Wait for modal
        setTimeout(() => {
            const nameInput = document.querySelector('input[placeholder*="Name"]') ||
                            document.querySelector('input[type="text"]');
            if (nameInput) {
                nameInput.value = profileName || 'Main';
                
                const saveBtn = document.querySelector('button:contains("Save")') ||
                               document.querySelector('button:contains("Confirm")');
                if (saveBtn) {
                    saveBtn.click();
                    return { success: true, message: 'Profile created' };
                }
            }
        }, 1500);
        return { success: true, message: 'Profile creation started' };
    }
    return { success: false, message: 'Add profile button not found' };
}

// ─── SELECT KIDS PROFILE ───
function selectKidsProfile() {
    const profiles = document.querySelectorAll('.profile-item, .profile-card, [data-testid="profile-item"]');
    for (const profile of profiles) {
        if (profile.textContent.toLowerCase().includes('kids') ||
            profile.textContent.toLowerCase().includes('child') ||
            profile.textContent.toLowerCase().includes('kid')) {
            profile.click();
            return { success: true, message: 'Kids profile selected' };
        }
    }
    return { success: false, message: 'Kids profile not found' };
}

// ─── SELECT ADULT PROFILE ───
function selectAdultProfile() {
    const profiles = document.querySelectorAll('.profile-item, .profile-card, [data-testid="profile-item"]');
    for (const profile of profiles) {
        const text = profile.textContent.toLowerCase();
        if (!text.includes('kids') && !text.includes('child') && !text.includes('kid')) {
            profile.click();
            return { success: true, message: 'Adult profile selected' };
        }
    }
    // Fallback: click first profile
    if (profiles.length > 0) {
        profiles[0].click();
        return { success: true, message: 'First profile selected' };
    }
    return { success: false, message: 'No profile found' };
}

// ─── AUTO BYPASS ON LOAD ───
function autoBypassOnLoad() {
    chrome.storage.local.get(['autoBypass', 'defaultProfile'], function(data) {
        if (data.autoBypass) {
            console.log('🔄 Auto-bypass enabled, running...');
            setTimeout(() => {
                const result = bypassProfile(data.defaultProfile || 'auto');
                if (result.success) {
                    console.log('✅ Auto-bypass successful');
                    // Show notification if enabled
                    chrome.storage.local.get(['showNotification'], function(notifData) {
                        if (notifData.showNotification) {
                            showInPageNotification('✅ Profile bypassed!');
                        }
                    });
                }
            }, 1500);
        }
    });
}

// ─── SHOW IN-PAGE NOTIFICATION ───
function showInPageNotification(text) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        background: rgba(0,0,0,0.85);
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        font-size: 14px;
        font-family: -apple-system, sans-serif;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        animation: fadeInUp 0.3s ease;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    notif.textContent = text;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transition = 'opacity 0.3s';
        setTimeout(() => notif.remove(), 300);
    }, 2000);
}

// ─── MESSAGE HANDLER ───
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('📨 Message received:', request.action);

    switch(request.action) {
        case 'bypass':
            const result = bypassProfile(request.profile);
            sendResponse(result);
            break;

        case 'selectKids':
            const kidsResult = selectKidsProfile();
            sendResponse(kidsResult);
            break;

        case 'selectAdult':
            const adultResult = selectAdultProfile();
            sendResponse(adultResult);
            break;

        case 'createProfile':
            const createResult = createNewProfile(request.name || 'Main');
            sendResponse(createResult);
            break;

        case 'clearBypass':
            // Reset all bypass settings
            localStorage.removeItem('profileSelected');
            localStorage.removeItem('skipProfile');
            localStorage.removeItem('autoSelect');
            sessionStorage.removeItem('profileSelected');
            
            // Reload page
            location.reload();
            sendResponse({ success: true, message: 'Reset and reloading' });
            break;

        case 'getStatus':
            sendResponse({
                bypassed: isBypassed,
                profileSelected: profileSelected,
                url: window.location.href
            });
            break;

        default:
            sendResponse({ success: false, message: 'Unknown action' });
    }

    return true;
});

// ─── INIT ───
function init() {
    console.log('🚀 Hotstar Bypass Extension initialized');
    
    // Check if we're on Hotstar or JioCinema
    const url = window.location.href;
    if (url.includes('hotstar.com') || url.includes('jiocinema.com')) {
        console.log('✅ Hotstar/JioCinema detected');
        
        // Run auto-bypass
        autoBypassOnLoad();
        
        // Monitor for profile screen
        const observer = new MutationObserver(() => {
            const profileContainer = document.querySelector('.profile-selector-container');
            if (profileContainer && !profileSelected) {
                console.log('🔍 Profile screen detected, bypassing...');
                chrome.storage.local.get(['autoBypass'], function(data) {
                    if (data.autoBypass) {
                        bypassProfile('auto');
                    }
                });
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// ─── RUN ───
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('👿 Hotstar Profile Bypass ready');
