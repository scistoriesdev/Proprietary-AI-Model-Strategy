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
      swRegistration = await navigator.serviceWorker.register('./service-worker.js');
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
  { title: 'LoRA Training', keywords: 'lora low-rank adaptation fine-tuning training model weights', url: 'training.html', section: 'Training',
    content: 'Low-Rank Adaptation trains small adapter weights instead of full model. Produces safetensors files typically 10-200MB. You own the LoRA weights as they contain your unique training data patterns.' },
  { title: 'Style LoRA', keywords: 'style artistic look studio visual aesthetic', url: 'training.html#style-lora', section: 'Training',
    content: 'Captures rendering aesthetics like flat vector, watercolor, or realistic 3D look. Train on 30-100 images with consistent artistic style. Use trigger word like mystyle to activate.' },
  { title: 'Subject LoRA', keywords: 'subject organelle morphology biology anatomy', url: 'training.html#subject-lora', section: 'Training',
    content: 'Teaches specific biological structures like mitochondria, nucleus, or cell membrane. Requires anatomically accurate reference images with proper morphology.' },
  { title: 'ControlNet', keywords: 'controlnet geometry structure spatial layout composition', url: 'training.html#controlnet', section: 'Training',
    content: 'Guides generation with depth maps, canny edges, or normal maps. Use ControlNet Union for flexibility. Essential for maintaining anatomical structure and composition.' },
  { title: 'Regional Prompting', keywords: 'regional prompting attention masking composition', url: 'training.html#regional', section: 'Training',
    content: 'Assign different prompts to masked regions. Paint nucleus area and assign specific prompt while cytoplasm gets different prompt. Use attention couple nodes in ComfyUI.' },
  { title: 'Hyperparameters', keywords: 'hyperparameters learning rate batch size epochs rank alpha network dim', url: 'training.html#hyperparameters', section: 'Training',
    content: 'Learning rate typically 1e-4 to 5e-4. Network rank 16-128, higher for complex subjects. Alpha usually equals rank. Batch size 1-4 depending on VRAM. Train 1000-3000 steps for SDXL LoRA.' },
  { title: 'Training Workflow', keywords: 'workflow dataset captioning onetrainer kohya', url: 'training.html#workflow', section: 'Training',
    content: 'Prepare dataset 20-100 images. Caption using Florence-2 or manual tags. Configure hyperparameters. Monitor loss curves in TensorBoard. Export safetensors when loss stabilizes.' },
  { title: 'Training Art Styles', keywords: 'flat vector isometric realistic cross-section microscopy watercolor', url: 'training.html#training-art', section: 'Training',
    content: 'Flat vector for icons and diagrams. Isometric 3D for technical illustration. Realistic render for publication quality. Cross-section for internal anatomy. SEM microscopy style for electron microscope look.' },
  { title: 'Public Domain Sources', keywords: 'grays anatomy biodiversity heritage wellcome collection creative commons', url: 'training.html#public-domain', section: 'Training',
    content: 'Grays Anatomy 1918 edition public domain. Biodiversity Heritage Library has historical illustrations. Wellcome Collection CC-BY. OpenStax biology textbooks CC-BY. NASA images public domain.' },
  { title: 'Platform Setup Windows', keywords: 'windows powershell nvidia cuda python venv', url: 'training.html#platform-setup', section: 'Training',
    content: 'Install Python 3.10 from python.org. Create venv at C:\\AI\\training-env. Clone OneTrainer and run install.bat. Set PYTORCH_CUDA_ALLOC_CONF for memory optimization. Disable Game Mode.' },
  { title: 'Platform Setup Linux', keywords: 'linux ubuntu nvidia driver cuda ppa', url: 'training.html#platform-setup', section: 'Training',
    content: 'Ubuntu 22.04 LTS recommended. Install nvidia-driver-550 from PPA. Download CUDA 12.1+ toolkit. Set persistence mode with nvidia-smi -pm 1. Configure file descriptor limits.' },
  { title: 'Platform Setup macOS', keywords: 'macos apple silicon m1 m2 m3 mps metal', url: 'training.html#platform-setup', section: 'Training',
    content: 'Apple Silicon M1/M2/M3 uses Metal MPS backend. Good for inference, limited for training. Install via Homebrew and pyenv. Set PYTORCH_ENABLE_MPS_FALLBACK=1. Use cloud for production training.' },
  { title: 'Platform Setup RunPod', keywords: 'runpod cloud gpu pod container volume sftp', url: 'training.html#platform-setup', section: 'Training',
    content: 'RTX 4090 at $0.70/hr or A100 at $1.50/hr. Create pod with PyTorch 2.1 template. Upload dataset via SFTP or rclone. Use tmux to persist training session. Always terminate pod after downloading.' },
  
  // Scientific page
  { title: 'Base Models', keywords: 'sdxl flux stable diffusion base model foundation', url: 'scientific.html', section: 'Scientific',
    content: 'SDXL 1.0 generates 1024x1024 images with two text encoders. Flux.1 uses flow matching and MMDiT transformer architecture. Choose based on required output quality and training complexity.' },
  { title: 'SDXL Architecture', keywords: 'sdxl stable diffusion xl architecture text encoder unet', url: 'scientific.html#sdxl', section: 'Scientific',
    content: 'Stable Diffusion XL has 2.6B parameter UNet with dual text encoders CLIP ViT-L and OpenCLIP ViT-bigG. Native 1024x1024 resolution. Refiner model available for enhanced details.' },
  { title: 'Flux.1 Architecture', keywords: 'flux flow matching mmdit transformer rectified flow', url: 'scientific.html#flux', section: 'Scientific',
    content: 'Flux uses Multimodal Diffusion Transformer MMDiT with 12B parameters. Flow matching provides straighter sampling paths. T5-XXL text encoder for better prompt following. Dev version for commercial use.' },
  { title: '3D Blockout', keywords: '3d blockout blender zbrush depth normal map reference', url: 'scientific.html#3d-blockout', section: 'Scientific',
    content: 'Create rough 3D geometry in Blender or ZBrush. Render depth and normal passes. Use as ControlNet input to guide generation. Ensures consistent spatial structure across outputs.' },
  { title: 'XY Plot Validation', keywords: 'xy plot validation testing checkpoint evaluation weight comparison', url: 'scientific.html#xy-plot', section: 'Scientific',
    content: 'Generate grid comparing different LoRA weights or checkpoints. Test weight values 0.5 to 1.0 on X axis, different prompts on Y. Identify optimal weight before production use.' },
  { title: 'Color Theory', keywords: 'color theory palette biological visualization accessibility colorblind', url: 'scientific.html#color', section: 'Scientific',
    content: 'Use consistent organelle color coding. Nucleus typically blue, mitochondria red or orange, ER purple or pink. Consider colorblind accessibility with viridis or cividis palettes.' },
  { title: 'Anatomical Accuracy', keywords: 'anatomical accuracy mitochondria nucleus cell membrane cristae', url: 'scientific.html#accuracy', section: 'Scientific',
    content: 'Mitochondria must show cristae inner membrane folds. Nucleus needs nuclear envelope with pores. Golgi requires stacked cisternae. Validate against electron microscopy references.' },
  
  // Hardware page
  { title: 'GPU Requirements', keywords: 'gpu vram rtx nvidia graphics card hardware cuda cores', url: 'hardware.html', section: 'Hardware',
    content: 'NVIDIA RTX GPUs required for CUDA support. Minimum 8GB VRAM with heavy optimization. 12GB comfortable for SDXL. 16GB+ ideal for Flux. Cloud GPUs available for larger models.' },
  { title: 'VRAM Thresholds', keywords: 'vram memory 8gb 12gb 16gb 24gb threshold oom out of memory', url: 'hardware.html#vram', section: 'Hardware',
    content: '8GB requires FP8 quantization and batch size 1. 12GB enables standard SDXL training. 16GB allows larger batch sizes and Flux FP8. 24GB A100 80GB for full precision large batches.' },
  { title: 'GPU Comparison', keywords: 'gpu comparison rtx 3060 3070 3080 4060 4070 4080 4090 benchmark', url: 'hardware.html#comparison', section: 'Hardware',
    content: 'RTX 3060 12GB entry level local training. RTX 4070 12GB good performance per watt. RTX 4090 24GB flagship consumer best for local. A100 80GB cloud optimal for production.' },
  { title: 'Memory Optimization', keywords: 'memory optimization fp8 bf16 gradient checkpointing adafactor 8bit adam', url: 'hardware.html#optimization', section: 'Hardware',
    content: 'FP8 quantization halves memory usage with minimal quality loss. Gradient checkpointing trades compute for memory. Adafactor optimizer uses less memory than Adam. 8-bit Adam available in bitsandbytes.' },
  { title: 'Thermal Management', keywords: 'thermal temperature cooling laptop heat throttling fan curve', url: 'hardware.html#thermal', section: 'Hardware',
    content: 'Keep GPU below 83C during training. Use laptop cooling pad for mobile workstations. Set custom fan curves with MSI Afterburner. Monitor with nvidia-smi or nvtop. Training throttles above thermal limits.' },
  { title: 'OneTrainer vs Kohya', keywords: 'onetrainer kohya software training tool gui comparison', url: 'hardware.html#software', section: 'Hardware',
    content: 'OneTrainer better for low VRAM with aggressive optimization. Kohya more features and community presets. OneTrainer has modern GUI. Kohya requires more manual configuration. Both produce same output format.' },
  
  // Cloud page
  { title: 'Cloud Infrastructure', keywords: 'cloud infrastructure runpod lambda vast gpu rental provider', url: 'cloud.html', section: 'Cloud',
    content: 'Rent GPUs by the hour for training. Avoid large upfront hardware costs. Scale up for production training then terminate. Keep proprietary data secure with encrypted transfers.' },
  { title: 'RunPod', keywords: 'runpod secure cloud gpu rental container docker soc2', url: 'cloud.html#runpod', section: 'Cloud',
    content: 'RunPod recommended for secure training. SOC 2 compliant Secure Cloud tier available. RTX 4090 at $0.70/hr, A100 at $1.50/hr. Persistent volumes for model storage. SFTP and web terminal access.' },
  { title: 'Lambda Labs', keywords: 'lambda labs cloud provider h100 a100 enterprise', url: 'cloud.html#lambda', section: 'Cloud',
    content: 'Enterprise-grade H100 and A100 instances. Higher cost but reliable availability. Good for teams needing consistent access. API and dashboard management.' },
  { title: 'Vast.ai', keywords: 'vast ai p2p marketplace gpu rental budget community', url: 'cloud.html#vast', section: 'Cloud',
    content: 'Peer-to-peer GPU marketplace with lowest prices. Variable reliability and security. Best for non-sensitive experimentation. Verify machine specs before use. Not recommended for proprietary IP.' },
  { title: 'SaaS Training', keywords: 'saas fal astria scenario managed training service api', url: 'cloud.html#saas', section: 'Cloud',
    content: 'Managed training services handle infrastructure. fal.ai for serverless inference. Astria for fine-tuning API. Scenario for game assets. Replicate for model hosting. Trade control for convenience.' },
  { title: 'Hybrid Workflow', keywords: 'hybrid workflow local cloud burst compute split', url: 'cloud.html#hybrid', section: 'Cloud',
    content: 'Prepare datasets locally. Upload to cloud for training. Download trained LoRA. Run inference locally. Minimizes cloud costs while leveraging cloud compute for heavy training.' },
  { title: 'Data Security', keywords: 'data security encryption privacy ip protection proprietary', url: 'cloud.html#security', section: 'Cloud',
    content: 'Encrypt datasets before cloud upload. Use secure cloud tiers for proprietary work. Delete volumes after project completion. Never store API keys in pod. Verify provider security certifications.' },
  
  // Legal page
  { title: 'IP Ownership', keywords: 'ip intellectual property ownership rights model weights safetensors', url: 'legal.html', section: 'Legal',
    content: 'LoRA weights are your property as derivative work. Safetensors files contain unique patterns from your training. Document training process to establish ownership. Keep weights as trade secrets.' },
  { title: 'Copyright', keywords: 'copyright ai generated human authorship usco registration', url: 'legal.html#copyright', section: 'Legal',
    content: 'Human creative input required for copyright. Document your artistic decisions and curation. USCO requires disclosure of AI involvement. Pure AI output may not be copyrightable.' },
  { title: 'Training Data Rights', keywords: 'training data fair use licensing public domain cc0', url: 'legal.html#training-data', section: 'Legal',
    content: 'Use public domain or properly licensed training data. Fair use is unsettled for AI training. CC0 and public domain safest for commercial. Document all data sources in manifest.' },
  { title: 'Base Model Licenses', keywords: 'sdxl flux license rail apache commercial non-commercial', url: 'legal.html#licenses', section: 'Legal',
    content: 'SDXL uses CreativeML Open RAIL license allowing commercial use. Flux.1 Dev is non-commercial research only. Flux.1 Schnell is Apache 2.0 fully commercial. Your LoRA weights are your property separate from base model.' },
  { title: 'AI Contract Templates', keywords: 'contract clause template scope services intellectual property disclosure', url: 'legal.html#contracts', section: 'Legal',
    content: 'Scope of services clause for AI-inclusive work. IP clause protecting LoRA ownership. AI disclosure clause for transparency. Limitation of liability clause for medical context. Confidentiality clause for training data.' },
  { title: 'Case Law Precedents', keywords: 'thaler perlmutter zarya dawn getty stability andersen copyright', url: 'legal.html#caselaw', section: 'Legal',
    content: 'Thaler v Perlmutter ruled AI cannot be author. Zarya of the Dawn got partial protection for human arrangement. Getty v Stability AI pending on training data. Waymo v Uber established AI models as trade secrets.' },
  { title: 'International Law', keywords: 'international law gdpr eu uk jurisdiction data protection', url: 'legal.html#international', section: 'Legal',
    content: 'GDPR applies to EU personal data in training sets. Different jurisdictions have varying AI regulations. UK and EU diverging on AI copyright. Consider data residency requirements.' },
  { title: 'Commercial Licensing', keywords: 'commercial licensing work for hire royalty disclosure client', url: 'legal.html#licensing', section: 'Legal',
    content: 'Define AI tool usage in client contracts. Specify whether AI-assisted outputs are work for hire. Disclose AI involvement per contract terms. Consider royalty implications for AI-enhanced work.' },
  { title: 'Medical Regulations', keywords: 'medical regulations fda cme hipaa publication disclaimer', url: 'legal.html#medical', section: 'Legal',
    content: 'Medical illustrations may require FDA review for device marketing. CME content has accuracy requirements. HIPAA applies if using patient data. Include appropriate disclaimers on AI-generated medical content.' },
  { title: 'Ethics Guidelines', keywords: 'ethics transparency accuracy ami gnsi professional standards', url: 'legal.html#ethics', section: 'Legal',
    content: 'Transparency standards vary by audience. Scientific publishers require full disclosure. Primum non nocere applies to medical illustrations. Would I Sign It test for professional standard. AMI developing AI ethics guidelines.' },
  { title: 'Insurance Coverage', keywords: 'insurance eo errors omissions cyber liability ip defense', url: 'legal.html#insurance', section: 'Legal',
    content: 'E&O insurance for professional errors. Check for AI-generated content exclusions. Cyber liability for cloud-stored training data. IP insurance for high-value LoRAs. Request AI-inclusive policy endorsement.' },
  
  // README
  { title: 'Full Documentation', keywords: 'readme documentation full guide reference complete', url: 'readme.html', section: 'README',
    content: 'Complete technical framework for proprietary AI model training. Covers infrastructure, methodology, legal frameworks, and operational workflows for medical illustration and cellular biology.' },
  { title: 'Table of Contents', keywords: 'table of contents toc navigation sections', url: 'readme.html#table-of-contents', section: 'README',
    content: 'Navigate to Executive Summary, Paradigm of Control, Infrastructure Architecture, Algorithmic Foundations, Data Engineering, Legal Frameworks, Operational Workflow, and Appendix.' },
  { title: 'Bio-Architect Pipeline', keywords: 'bio-architect pipeline comfyui workflow generation', url: 'readme.html', section: 'README',
    content: 'Complete ComfyUI workflow for biological illustration. Load base model and LoRA stack. Apply ControlNet with 3D blockout. Use regional prompting for organelle-specific prompts. Generate and refine.' },
  
  // Resources
  { title: 'Resources & Tools', keywords: 'resources links tools external software', url: 'resources.html', section: 'Resources',
    content: 'Curated links to all essential tools for hybrid AI training approach. Base models, training software, inference tools, cloud providers, and learning resources.' },
  { title: 'SDXL Model', keywords: 'sdxl stable diffusion xl base model huggingface stabilityai', url: 'resources.html', section: 'Resources',
    content: 'Download SDXL 1.0 base from Hugging Face stabilityai repository. Includes base model and refiner. Use safetensors format for security. 6.5GB download.' },
  { title: 'Flux Models', keywords: 'flux flow matching black forest labs schnell dev fp8', url: 'resources.html', section: 'Resources',
    content: 'Flux.1 Dev for commercial use, Schnell for fast 4-step generation. Available on Hugging Face from black-forest-labs. FP8 quantized versions reduce VRAM requirements.' },
  { title: 'ComfyUI', keywords: 'comfyui nodes workflow graph interface visual programming', url: 'resources.html', section: 'Resources',
    content: 'Node-based workflow interface for Stable Diffusion. Visual graph programming for complex pipelines. Extensive custom node ecosystem. Save and share workflows as JSON.' },
  { title: 'Automatic1111', keywords: 'automatic1111 a1111 webui gradio interface extensions', url: 'resources.html', section: 'Resources',
    content: 'Popular Gradio-based web interface. Extension ecosystem for additional features. Simple interface for basic generation. Built-in training capabilities via extensions.' },
  { title: 'OneTrainer', keywords: 'onetrainer lora training gui software windows', url: 'resources.html', section: 'Resources',
    content: 'Modern GUI for LoRA training. Excellent VRAM optimization. Windows installer available. Real-time preview during training. Supports SDXL and Flux.' },
  { title: 'Kohya', keywords: 'kohya ss sd-scripts training lora dreambooth textual inversion', url: 'resources.html', section: 'Resources',
    content: 'Feature-rich training scripts. Large community preset library. Supports LoRA, DreamBooth, and textual inversion. Both CLI and GUI available via kohya_ss.' },
  { title: 'CivitAI', keywords: 'civitai community models lora checkpoints download share', url: 'resources.html', section: 'Resources',
    content: 'Community hub for sharing models and LoRAs. Browse thousands of checkpoints. Download community-trained LoRAs for reference. Upload your own models.' },
  { title: 'Hugging Face', keywords: 'huggingface hub models datasets diffusers transformers', url: 'resources.html', section: 'Resources',
    content: 'Official model weights repository. Diffusers library for Python integration. Datasets for training. Model cards with usage documentation.' },
  { title: 'Cloud Providers', keywords: 'runpod lambda vast paperspace cloud gpu rental pricing', url: 'resources.html', section: 'Resources',
    content: 'RunPod from $0.70/hr for RTX 4090. Lambda Labs for enterprise H100. Vast.ai budget marketplace. Paperspace for notebooks and VMs. Compare pricing and availability.' },
  { title: 'SaaS Platforms', keywords: 'fal astria scenario replicate modal together serverless', url: 'resources.html', section: 'Resources',
    content: 'fal.ai serverless inference. Astria fine-tuning API. Scenario game asset training. Replicate model hosting. Modal serverless Python. Together AI inference API.' },
  { title: 'Blender', keywords: 'blender 3d modeling rendering free open source blockout', url: 'resources.html', section: 'Resources',
    content: 'Free open-source 3D software. Create blockout geometry for ControlNet. Render depth and normal passes. Large community and tutorials available.' },
  { title: 'ZBrush', keywords: 'zbrush sculpting organic anatomy 3d professional', url: 'resources.html', section: 'Resources',
    content: 'Professional sculpting software. Ideal for organic biological forms. Create detailed anatomy references. Export to other 3D applications.' },
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
      let matchedContent = null;
      const titleLower = item.title.toLowerCase();
      const keywordsLower = item.keywords.toLowerCase();
      const contentLower = (item.content || '').toLowerCase();
      
      // Exact title match (highest score)
      if (titleLower === query) score += 100;
      // Title starts with query
      else if (titleLower.startsWith(query)) score += 50;
      // Title contains query
      else if (titleLower.includes(query)) score += 30;
      // Keywords contain query
      if (keywordsLower.includes(query)) score += 20;
      
      // Content contains query (new!)
      if (contentLower.includes(query)) {
        score += 15;
        // Extract snippet around match
        const matchIndex = contentLower.indexOf(query);
        const snippetStart = Math.max(0, matchIndex - 30);
        const snippetEnd = Math.min(item.content.length, matchIndex + query.length + 60);
        matchedContent = (snippetStart > 0 ? '...' : '') + 
                         item.content.substring(snippetStart, snippetEnd) + 
                         (snippetEnd < item.content.length ? '...' : '');
      }
      
      // Partial word matches in keywords
      const queryWords = query.split(' ');
      queryWords.forEach(word => {
        if (word.length >= 2) {
          if (keywordsLower.includes(word)) score += 10;
          // Also check content for partial matches
          if (contentLower.includes(word)) score += 5;
        }
      });
      
      return { ...item, score, matchedContent };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
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
       class="search-result block px-4 py-2 hover:bg-slate-50 cursor-pointer ${index === selectedIndex ? 'bg-teal-50' : ''}"
       data-index="${index}">
      <div class="flex items-center gap-3">
        <span class="text-xs font-medium px-2 py-0.5 rounded ${getSectionColor(item.section)}">${item.section}</span>
        <span class="text-sm text-slate-700 font-medium">${highlightMatch(item.title)}</span>
      </div>
      ${item.matchedContent ? `<div class="text-xs text-slate-500 mt-1 ml-1 line-clamp-1">${highlightMatch(item.matchedContent)}</div>` : ''}
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
    'README': 'bg-slate-100 text-slate-700',
    'Resources': 'bg-cyan-100 text-cyan-700'
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
    const allTabs = ['ownership', 'training', 'licenses', 'contracts', 'caselaw', 'international', 'commercial', 'medical', 'ethics', 'insurance'];
    allTabs.forEach(id => {
        const el = document.getElementById(`legal-content-${id}`);
        const tab = document.getElementById(`legal-tab-${id}`);
        if(el) el.classList.add('hidden');
        if(tab) {
            tab.classList.remove('border-b-2', 'border-amber-500', 'text-amber-700', 'bg-amber-50/50', 'font-semibold');
            tab.classList.add('text-slate-500', 'font-medium');
        }
    });
    const content = document.getElementById(`legal-content-${tabId}`);
    const activeBtn = document.getElementById(`legal-tab-${tabId}`);
    if(content) content.classList.remove('hidden');
    if(activeBtn) {
        activeBtn.classList.remove('text-slate-500', 'font-medium');
        activeBtn.classList.add('border-b-2', 'border-amber-500', 'text-amber-700', 'bg-amber-50/50', 'font-semibold');
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
    
    // Initialize mobile search
    initMobileSearch();
});

// ============================================
// Mobile Navigation
// ============================================

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    
    if (mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.remove('hidden');
        menuIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
    } else {
        mobileMenu.classList.add('hidden');
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
        // Close mobile search results when closing menu
        const mobileSearchResults = document.getElementById('mobile-search-results');
        if (mobileSearchResults) mobileSearchResults.classList.add('hidden');
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            toggleMobileMenu();
        }
    }
});

// ============================================
// Mobile Search
// ============================================

function initMobileSearch() {
    const mobileSearchInput = document.getElementById('mobile-search-input');
    const mobileSearchResults = document.getElementById('mobile-search-results');
    const mobileSearchContainer = document.getElementById('mobile-search-container');
    
    if (!mobileSearchInput || !mobileSearchResults) return;
    
    let debounceTimer;
    
    mobileSearchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = e.target.value.trim().toLowerCase();
            if (query.length < 2) {
                mobileSearchResults.classList.add('hidden');
                return;
            }
            performMobileSearch(query);
        }, 150);
    });
    
    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (mobileSearchContainer && !mobileSearchContainer.contains(e.target)) {
            mobileSearchResults.classList.add('hidden');
        }
    });
}

function performMobileSearch(query) {
    const mobileSearchResults = document.getElementById('mobile-search-results');
    
    // Use existing searchIndex
    const results = searchIndex
        .map(item => {
            let score = 0;
            const titleLower = item.title.toLowerCase();
            const keywordsLower = item.keywords.toLowerCase();
            const contentLower = (item.content || '').toLowerCase();
            
            if (titleLower === query) score += 100;
            else if (titleLower.startsWith(query)) score += 50;
            else if (titleLower.includes(query)) score += 30;
            if (keywordsLower.includes(query)) score += 20;
            if (contentLower.includes(query)) score += 15;
            
            return { ...item, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
    
    if (results.length === 0) {
        mobileSearchResults.innerHTML = `<div class="px-4 py-3 text-sm text-slate-500">No results found</div>`;
        mobileSearchResults.classList.remove('hidden');
        return;
    }
    
    mobileSearchResults.innerHTML = results.map(item => `
        <a href="${item.url}" class="block px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0">
            <div class="flex items-center gap-2">
                <span class="text-xs font-medium px-2 py-0.5 rounded ${getSectionColor(item.section)}">${item.section}</span>
                <span class="text-sm text-slate-700 font-medium">${item.title}</span>
            </div>
        </a>
    `).join('');
    
    mobileSearchResults.classList.remove('hidden');
}

// Show mobile install button when available
function showInstallButton() {
    const btn = document.getElementById('install-btn');
    if (btn) btn.classList.remove('hidden');
    
    // Also show mobile install container
    const mobileInstall = document.getElementById('mobile-install-container');
    if (mobileInstall) mobileInstall.classList.remove('hidden');
}

function hideInstallButton() {
    const btn = document.getElementById('install-btn');
    if (btn) btn.classList.add('hidden');
    
    // Also hide mobile install container
    const mobileInstall = document.getElementById('mobile-install-container');
    if (mobileInstall) mobileInstall.classList.add('hidden');
}
