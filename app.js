// AI Model Training Strategy - Shared JavaScript

// ============================================
// PWA Service Worker Registration & Updates
// ============================================

let deferredPrompt = null;
let swRegistration = null;

// Update check interval (check every 5 minutes when page is visible)
const UPDATE_CHECK_INTERVAL = 5 * 60 * 1000;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      swRegistration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('[PWA] Service Worker registered:', swRegistration.scope);
      
      // Check for updates on registration
      swRegistration.addEventListener('updatefound', () => {
        const newWorker = swRegistration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner('New version available!', 'Update Now');
          }
        });
      });

      // Periodically check for updates
      setInterval(() => {
        if (document.visibilityState === 'visible') {
          swRegistration.update();
          navigator.serviceWorker.controller?.postMessage({ type: 'CHECK_FOR_UPDATES' });
        }
      }, UPDATE_CHECK_INTERVAL);

      // Listen for messages from Service Worker
      navigator.serviceWorker.addEventListener('message', handleSWMessage);

    } catch (error) {
      console.log('[PWA] Service Worker registration failed:', error);
    }
  });
}

// Handle messages from the Service Worker
function handleSWMessage(event) {
  const { type, version, url, message, currentVersion, newVersion } = event.data || {};
  
  console.log('[PWA] Message from SW:', type, event.data);
  
  switch (type) {
    case 'SW_UPDATED':
      console.log('[PWA] Service Worker updated to version:', version);
      showUpdateBanner(`Updated to v${version}`, 'Refresh', true);
      break;
      
    case 'CONTENT_UPDATED':
      console.log('[PWA] Content updated:', url);
      showContentUpdateNotification(url);
      break;
      
    case 'UPDATE_AVAILABLE':
      console.log('[PWA] New version available:', newVersion);
      showUpdateBanner(`Update available: v${newVersion}`, 'Update Now');
      break;
      
    case 'CACHE_CLEARED':
      console.log('[PWA] Cache cleared');
      showUpdateBanner('Cache cleared. Refreshing...', null, true);
      setTimeout(() => window.location.reload(), 1500);
      break;
      
    case 'VERSION_INFO':
      console.log('[PWA] Current version:', version);
      break;
  }
}

// Show update banner with optional auto-refresh
function showUpdateBanner(message, buttonText, autoRefresh = false) {
  // Remove existing banner if any
  const existing = document.getElementById('update-banner');
  if (existing) existing.remove();
  
  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.className = 'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-teal-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between animate-slide-up';
  
  let html = `<span class="text-sm font-medium">${message}</span>`;
  if (buttonText) {
    html += `<button onclick="updateApp()" class="bg-white text-teal-700 px-3 py-1 rounded text-sm font-semibold hover:bg-teal-50 transition ml-3">${buttonText}</button>`;
  }
  html += `<button onclick="this.parentElement.remove()" class="ml-2 text-white/70 hover:text-white">✕</button>`;
  
  banner.innerHTML = html;
  document.body.appendChild(banner);
  
  // Auto-dismiss after 10 seconds if not auto-refresh
  if (!autoRefresh) {
    setTimeout(() => banner.remove(), 10000);
  }
}

// Show subtle notification for content updates (doesn't require full refresh)
function showContentUpdateNotification(url) {
  // Only show for current page
  if (!url.includes(window.location.pathname) && window.location.pathname !== '/') {
    return;
  }
  
  const notification = document.createElement('div');
  notification.className = 'fixed top-20 right-4 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm flex items-center gap-2 animate-slide-down';
  notification.innerHTML = `
    <svg class="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
    </svg>
    <span>Content updated</span>
    <button onclick="window.location.reload()" class="text-teal-400 hover:text-teal-300 font-medium ml-2">Refresh</button>
    <button onclick="this.parentElement.remove()" class="text-white/50 hover:text-white ml-1">✕</button>
  `;
  document.body.appendChild(notification);
  
  // Auto-dismiss after 8 seconds
  setTimeout(() => notification.remove(), 8000);
}

// Handle install prompt (for Add to Home Screen)
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

// Handle successful installation
window.addEventListener('appinstalled', () => {
  console.log('[PWA] App installed successfully');
  deferredPrompt = null;
  hideInstallButton();
});

function showInstallButton() {
  const btn = document.getElementById('install-btn');
  if (btn) btn.classList.remove('hidden');
}

function hideInstallButton() {
  const btn = document.getElementById('install-btn');
  if (btn) btn.classList.add('hidden');
}

async function installPWA() {
  if (!deferredPrompt) return;
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log('[PWA] Install prompt outcome:', outcome);
  deferredPrompt = null;
  hideInstallButton();
}

function updateApp() {
  if ('serviceWorker' in navigator && swRegistration) {
    // If there's a waiting worker, tell it to skip waiting
    if (swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }
  window.location.reload();
}

// Force update - clears all caches and reloads
function forceUpdate() {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'FORCE_UPDATE' });
  } else {
    window.location.reload(true);
  }
}

// Get current SW version
function getVersion() {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'GET_VERSION' });
  }
}

// ============================================
// Navigation
function scrollToSection(id) {
    const el = document.getElementById(id);
    if(el) el.scrollIntoView({ behavior: 'smooth' });
}

// Tech Methodology Tabs
function switchTab(tabId) {
    ['lora', 'controlnet', 'software'].forEach(id => {
        const el = document.getElementById(`content-${id}`);
        const tab = document.getElementById(`tab-${id}`);
        if(el) el.classList.add('hidden');
        if(tab) {
            tab.classList.remove('border-teal-600', 'text-teal-700', 'bg-teal-50/50');
            tab.classList.add('text-slate-500');
        }
    });
    const content = document.getElementById(`content-${tabId}`);
    const activeBtn = document.getElementById(`tab-${tabId}`);
    if(content) content.classList.remove('hidden');
    if(activeBtn) {
        activeBtn.classList.remove('text-slate-500');
        activeBtn.classList.add('border-teal-600', 'text-teal-700', 'bg-teal-50/50');
    }
}

// Legal Tabs
function switchLegalTab(tabId) {
    ['ownership', 'training', 'international', 'commercial', 'medical'].forEach(id => {
        const el = document.getElementById(`legal-content-${id}`);
        const tab = document.getElementById(`legal-tab-${id}`);
        if(el) el.classList.add('hidden');
        if(tab) {
            tab.classList.remove('border-amber-500', 'text-amber-700', 'bg-amber-50/50');
            tab.classList.add('text-slate-500');
        }
    });
    const content = document.getElementById(`legal-content-${tabId}`);
    const activeBtn = document.getElementById(`legal-tab-${tabId}`);
    if(content) content.classList.remove('hidden');
    if(activeBtn) {
        activeBtn.classList.remove('text-slate-500');
        activeBtn.classList.add('border-amber-500', 'text-amber-700', 'bg-amber-50/50');
    }
}

// Hardware Calculator
let currentVram = 12;

function updateCalc(vram) {
    currentVram = vram;
    document.querySelectorAll('.vram-btn').forEach(btn => {
        btn.classList.remove('bg-slate-800', 'text-white', 'active-vram');
        if(parseInt(btn.dataset.val) === vram) btn.classList.add('bg-slate-800', 'text-white', 'active-vram');
    });
    runCalculation();
}

function runCalculation() {
    const resultBox = document.getElementById('calc-result');
    if (!resultBox) return;
    
    let html = '';
    let className = '';

    if (currentVram >= 12) {
        html = `<div class="flex items-start gap-3"><div class="text-2xl">✅</div><div><h4 class="font-bold text-teal-900 text-sm">Viable for Local Training</h4><p class="text-xs text-teal-800 mt-1">With 12GB VRAM + FP8/Adafactor, you can train SDXL locally.</p></div></div>`;
        className = "p-4 rounded-lg bg-teal-50 border border-teal-200 transition-all duration-300";
    } else if (currentVram >= 8) {
        html = `<div class="flex items-start gap-3"><div class="text-2xl">⚠️</div><div><h4 class="font-bold text-amber-900 text-sm">OneTrainer Required</h4><p class="text-xs text-amber-800 mt-1">Use <strong>OneTrainer</strong> with Gradient Checkpointing. Kohya will likely crash.</p></div></div>`;
        className = "p-4 rounded-lg bg-amber-50 border border-amber-200 transition-all duration-300";
    } else {
        html = `<div class="flex items-start gap-3"><div class="text-2xl">❌</div><div><h4 class="font-bold text-red-900 text-sm">Insufficient Memory</h4><p class="text-xs text-red-800 mt-1">Below 8GB, training modern models is not viable. <strong>Use RunPod.</strong></p></div></div>`;
        className = "p-4 rounded-lg bg-red-50 border border-red-200 transition-all duration-300";
    }
    resultBox.innerHTML = html;
    resultBox.className = className;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Run calculator if on hardware page
    if (document.getElementById('calc-result')) {
        runCalculation();
    }
});
