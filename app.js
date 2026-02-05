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
// Autocomplete Search
// ============================================

const searchIndex = [
  // Training page
  { title: 'LoRA Training', keywords: 'lora low-rank adaptation fine-tuning training model weights', url: 'training.html', section: 'Training' },
  { title: 'Style LoRA', keywords: 'style artistic look studio visual aesthetic', url: 'training.html#style-lora', section: 'Training' },
  { title: 'Subject LoRA', keywords: 'subject organelle morphology biology anatomy', url: 'training.html#subject-lora', section: 'Training' },
  { title: 'ControlNet', keywords: 'controlnet geometry structure spatial layout composition', url: 'training.html#controlnet', section: 'Training' },
  { title: 'Regional Prompting', keywords: 'regional prompting attention masking composition', url: 'training.html#regional', section: 'Training' },
  { title: 'Hyperparameters', keywords: 'hyperparameters learning rate batch size epochs rank alpha', url: 'training.html#hyperparameters', section: 'Training' },
  { title: 'Training Workflow', keywords: 'workflow dataset captioning onetrainer kohya', url: 'training.html#workflow', section: 'Training' },
  
  // Scientific page
  { title: 'Base Models', keywords: 'sdxl flux stable diffusion base model foundation', url: 'scientific.html', section: 'Scientific' },
  { title: 'SDXL Architecture', keywords: 'sdxl stable diffusion xl architecture text encoder', url: 'scientific.html#sdxl', section: 'Scientific' },
  { title: 'Flux.1 Architecture', keywords: 'flux flow matching mmdit transformer', url: 'scientific.html#flux', section: 'Scientific' },
  { title: '3D Blockout', keywords: '3d blockout blender zbrush depth normal map', url: 'scientific.html#3d-blockout', section: 'Scientific' },
  { title: 'XY Plot Validation', keywords: 'xy plot validation testing checkpoint evaluation', url: 'scientific.html#xy-plot', section: 'Scientific' },
  { title: 'Color Theory', keywords: 'color theory palette biological visualization accessibility', url: 'scientific.html#color', section: 'Scientific' },
  { title: 'Anatomical Accuracy', keywords: 'anatomical accuracy mitochondria nucleus cell membrane', url: 'scientific.html#accuracy', section: 'Scientific' },
  
  // Hardware page
  { title: 'GPU Requirements', keywords: 'gpu vram rtx nvidia graphics card hardware', url: 'hardware.html', section: 'Hardware' },
  { title: 'VRAM Thresholds', keywords: 'vram memory 8gb 12gb 16gb 24gb threshold', url: 'hardware.html#vram', section: 'Hardware' },
  { title: 'GPU Comparison', keywords: 'gpu comparison rtx 3060 3070 3080 4060 4070 4080 4090', url: 'hardware.html#comparison', section: 'Hardware' },
  { title: 'Memory Optimization', keywords: 'memory optimization fp8 gradient checkpointing adafactor', url: 'hardware.html#optimization', section: 'Hardware' },
  { title: 'Thermal Management', keywords: 'thermal temperature cooling laptop heat throttling', url: 'hardware.html#thermal', section: 'Hardware' },
  { title: 'OneTrainer vs Kohya', keywords: 'onetrainer kohya software training tool', url: 'hardware.html#software', section: 'Hardware' },
  
  // Cloud page
  { title: 'Cloud Infrastructure', keywords: 'cloud infrastructure runpod lambda vast gpu rental', url: 'cloud.html', section: 'Cloud' },
  { title: 'RunPod', keywords: 'runpod secure cloud gpu rental container docker', url: 'cloud.html#runpod', section: 'Cloud' },
  { title: 'Lambda Labs', keywords: 'lambda labs cloud provider h100 a100', url: 'cloud.html#lambda', section: 'Cloud' },
  { title: 'Vast.ai', keywords: 'vast ai p2p marketplace gpu rental security', url: 'cloud.html#vast', section: 'Cloud' },
  { title: 'SaaS Training', keywords: 'saas fal astria scenario managed training service', url: 'cloud.html#saas', section: 'Cloud' },
  { title: 'Hybrid Workflow', keywords: 'hybrid workflow local cloud burst compute', url: 'cloud.html#hybrid', section: 'Cloud' },
  { title: 'Data Security', keywords: 'data security encryption privacy ip protection', url: 'cloud.html#security', section: 'Cloud' },
  
  // Legal page
  { title: 'IP Ownership', keywords: 'ip intellectual property ownership rights model weights', url: 'legal.html', section: 'Legal' },
  { title: 'Copyright', keywords: 'copyright ai generated human authorship usco', url: 'legal.html#copyright', section: 'Legal' },
  { title: 'Training Data Rights', keywords: 'training data fair use licensing public domain', url: 'legal.html#training-data', section: 'Legal' },
  { title: 'International Law', keywords: 'international law gdpr eu uk jurisdiction', url: 'legal.html#international', section: 'Legal' },
  { title: 'Commercial Licensing', keywords: 'commercial licensing work for hire royalty disclosure', url: 'legal.html#licensing', section: 'Legal' },
  { title: 'Medical Regulations', keywords: 'medical regulations fda cme hipaa publication', url: 'legal.html#medical', section: 'Legal' },
  { title: 'Liability', keywords: 'liability insurance indemnification accuracy errors', url: 'legal.html#liability', section: 'Legal' },
  
  // README
  { title: 'Full Documentation', keywords: 'readme documentation full guide reference', url: 'readme.html', section: 'README' },
  { title: 'Table of Contents', keywords: 'table of contents toc navigation', url: 'readme.html#table-of-contents', section: 'README' },
];

let searchOpen = false;
let selectedIndex = -1;
let filteredResults = [];

function initSearch() {
  const searchContainer = document.getElementById('search-container');
  if (!searchContainer) return;
  
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  
  // Input handler with debounce
  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = e.target.value.trim().toLowerCase();
      if (query.length < 2) {
        searchResults.classList.add('hidden');
        filteredResults = [];
        return;
      }
      performSearch(query);
    }, 150);
  });
  
  // Keyboard navigation
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, filteredResults.length - 1);
      updateSelectedResult();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
      updateSelectedResult();
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      navigateToResult(filteredResults[selectedIndex]);
    } else if (e.key === 'Escape') {
      closeSearch();
    }
  });
  
  // Focus handler
  searchInput.addEventListener('focus', () => {
    if (searchInput.value.length >= 2) {
      performSearch(searchInput.value.trim().toLowerCase());
    }
  });
  
  // Click outside to close
  document.addEventListener('click', (e) => {
    if (!searchContainer.contains(e.target)) {
      closeSearch();
    }
  });
}

function performSearch(query) {
  const searchResults = document.getElementById('search-results');
  
  // Score and filter results
  filteredResults = searchIndex
    .map(item => {
      let score = 0;
      const titleLower = item.title.toLowerCase();
      const keywordsLower = item.keywords.toLowerCase();
      
      // Exact title match (highest score)
      if (titleLower === query) score += 100;
      // Title starts with query
      else if (titleLower.startsWith(query)) score += 50;
      // Title contains query
      else if (titleLower.includes(query)) score += 30;
      // Keywords contain query
      if (keywordsLower.includes(query)) score += 20;
      
      // Partial word matches in keywords
      const queryWords = query.split(' ');
      queryWords.forEach(word => {
        if (word.length >= 2 && keywordsLower.includes(word)) score += 10;
      });
      
      return { ...item, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
  
  if (filteredResults.length === 0) {
    searchResults.innerHTML = `
      <div class="px-4 py-3 text-sm text-slate-500">No results found for "${query}"</div>
    `;
    searchResults.classList.remove('hidden');
    return;
  }
  
  selectedIndex = -1;
  renderResults();
  searchResults.classList.remove('hidden');
}

function renderResults() {
  const searchResults = document.getElementById('search-results');
  
  searchResults.innerHTML = filteredResults.map((item, index) => `
    <a href="${item.url}" 
       class="search-result flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer ${index === selectedIndex ? 'bg-teal-50' : ''}"
       data-index="${index}">
      <span class="text-xs font-medium px-2 py-0.5 rounded ${getSectionColor(item.section)}">${item.section}</span>
      <span class="text-sm text-slate-700">${highlightMatch(item.title)}</span>
    </a>
  `).join('');
  
  // Add click handlers
  searchResults.querySelectorAll('.search-result').forEach(el => {
    el.addEventListener('click', (e) => {
      const index = parseInt(el.dataset.index);
      navigateToResult(filteredResults[index]);
    });
  });
}

function getSectionColor(section) {
  const colors = {
    'Training': 'bg-teal-100 text-teal-700',
    'Scientific': 'bg-purple-100 text-purple-700',
    'Hardware': 'bg-blue-100 text-blue-700',
    'Cloud': 'bg-indigo-100 text-indigo-700',
    'Legal': 'bg-amber-100 text-amber-700',
    'README': 'bg-slate-100 text-slate-700'
  };
  return colors[section] || 'bg-slate-100 text-slate-700';
}

function highlightMatch(text) {
  const searchInput = document.getElementById('search-input');
  const query = searchInput.value.trim();
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark class="bg-teal-200 rounded px-0.5">$1</mark>');
}

function updateSelectedResult() {
  const results = document.querySelectorAll('.search-result');
  results.forEach((el, index) => {
    if (index === selectedIndex) {
      el.classList.add('bg-teal-50');
      el.scrollIntoView({ block: 'nearest' });
    } else {
      el.classList.remove('bg-teal-50');
    }
  });
}

function navigateToResult(item) {
  window.location.href = item.url;
}

function closeSearch() {
  const searchResults = document.getElementById('search-results');
  if (searchResults) {
    searchResults.classList.add('hidden');
  }
  selectedIndex = -1;
}

function toggleSearch() {
  const searchContainer = document.getElementById('search-container');
  const searchInput = document.getElementById('search-input');
  
  if (searchContainer.classList.contains('hidden')) {
    searchContainer.classList.remove('hidden');
    searchInput.focus();
  } else {
    searchContainer.classList.add('hidden');
    closeSearch();
  }
}

// Keyboard shortcut (Ctrl/Cmd + K)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    toggleSearch();
  }
});

// Initialize search on DOM ready
document.addEventListener('DOMContentLoaded', initSearch);

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
