// AI Model Training Strategy - Shared JavaScript

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
