// FIX #27: use window.scrollY explicitly
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60), {passive:true});

// Active nav highlight
const secs   = [...document.querySelectorAll('section[id]')];
const nlinks = [...document.querySelectorAll('.nav-links a[data-s]')];
const setActive = () => {
  let cur = '';
  secs.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.id });
  nlinks.forEach(a => a.classList.toggle('active', a.dataset.s === cur));
};
window.addEventListener('scroll', setActive, {passive:true});
setActive();

// FIX #21: hamburger with aria-expanded
const burger  = document.getElementById('burger');
const mobMenu = document.getElementById('mobMenu');
const mobClose = document.getElementById('mobClose');
const toggle = open => {
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);  // FIX #21
  mobMenu.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
};
burger.addEventListener('click', () => toggle(!mobMenu.classList.contains('open')));
mobClose.addEventListener('click', () => toggle(false));
document.querySelectorAll('.mob-lnk').forEach(l => l.addEventListener('click', () => toggle(false)));

// FIX #28: scroll reveal — only runs if IntersectionObserver available
if ('IntersectionObserver' in window) {
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); }
    });
  }, {threshold: 0.08});
  document.querySelectorAll('.reveal').forEach(el => ro.observe(el));
} else {
  // FIX #28: fallback — show everything immediately if no IntersectionObserver
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}

// PDF Modal
const pdfModal      = document.getElementById('pdfModal');
const pdfModalFrame = document.getElementById('pdfModalFrame');
const pdfModalTitle = document.getElementById('pdfModalTitle');
const pdfModalDl    = document.getElementById('pdfModalDl');
const pdfModalClose = document.getElementById('pdfModalClose');

function openPDF(title, url) {
  if (!url || url === '#') {
    pdfModalFrame.src = 'about:blank';
    pdfModalFrame.srcdoc = '<div style="font-family:monospace;color:#7A9AAA;display:flex;align-items:center;justify-content:center;height:100%;background:#0D1117;font-size:13px;letter-spacing:.05em;">[ PDF not yet uploaded — replace the # with your PDF URL ]</div>';
    pdfModalDl.href = '#';
    pdfModalDl.style.opacity = '.4';
    pdfModalDl.style.pointerEvents = 'none';
  } else {
    const embedUrl = url.includes('drive.google.com')
      ? url.replace('/view', '/preview')
      : 'https://docs.google.com/viewer?embedded=true&url=' + encodeURIComponent(url);
    pdfModalFrame.removeAttribute('srcdoc');
    pdfModalFrame.src = embedUrl;
    pdfModalDl.href = url;
    pdfModalDl.style.opacity = '';
    pdfModalDl.style.pointerEvents = '';
  }
  pdfModalTitle.textContent = title;
  pdfModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePDF() {
  pdfModal.classList.remove('open');
  pdfModalFrame.removeAttribute('srcdoc');
  pdfModalFrame.src = 'about:blank';
  document.body.style.overflow = '';
}

pdfModalClose.addEventListener('click', closePDF);
pdfModal.addEventListener('click', e => { if (e.target === pdfModal) closePDF(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && pdfModal.classList.contains('open')) closePDF(); });

// ── PROJECT GALLERY ──

// Screenshot data — replace '#' values with your real image URLs.
// Use direct image links (imgur, GitHub raw, Google Drive direct link, or your own server).
// Each project has an array of { src, caption } objects.
// Add as many screenshots as you want per project — the grid handles it automatically.
const galleryData = {
  soc: [
    { src:'#', caption:'Wazuh dashboard — active alerts overview' },
    { src:'#', caption:'Sysmon log output — process creation events' },
    { src:'#', caption:'MITRE ATT\&CK technique mapping' },
    { src:'#', caption:'Windows endpoint log collection configured' }
  ],
  vault: [
    { src:'#', caption:'CLI interface — add and retrieve entries' },
    { src:'#', caption:'GUI window — password manager interface' },
    { src:'#', caption:'Encrypted vault file output' }
  ],
  subdomain: [
    { src:'Subdomain2.png', caption:'Terminal scan output — 312 subdomains found' },
    { src:'Subdomain(1).png', caption:'CSV export — structured results file' },
    { src:'Subdomain (2).png', caption:'Multi-threaded scan speed benchmark' }
  ],
  portfolio: [
    { src:'#', caption:'Hero section — desktop view' },
    { src:'#', caption:'Projects section — card layout' },
    { src:'#', caption:'Mobile responsive view' }
  ]
};

const galleryModal  = document.getElementById('galleryModal');
const galleryGrid   = document.getElementById('galleryGrid');
const galleryTitle  = document.getElementById('galleryModalTitle');
const galleryClose  = document.getElementById('galleryModalClose');
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxCap   = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');

function openGallery(title, key) {
  const shots = galleryData[key] || [];
  galleryTitle.textContent = title;
  galleryGrid.innerHTML = '';

  if (shots.length === 0) {
    galleryGrid.innerHTML = '<div class="gallery-empty">[ No screenshots uploaded yet — add image URLs to galleryData in the JS ]</div>';
  } else {
    shots.forEach((shot, i) => {
      const item = document.createElement('div');
      item.className = 'gallery-item';

      if (!shot.src || shot.src === '#') {
        // Placeholder for images not yet uploaded
        item.innerHTML = `
          <div class="gallery-placeholder">
            <div class="gallery-placeholder-icon">🖼</div>
            <div class="gallery-placeholder-text">[ Replace '#' with your image URL in galleryData.${key}[${i}] ]</div>
          </div>
          <div class="gallery-caption">${shot.caption}</div>`;
      } else {
        item.innerHTML = `
          <img src="${shot.src}" alt="${shot.caption}" loading="lazy">
          <div class="gallery-caption">${shot.caption}</div>`;
        item.addEventListener('click', () => openLightbox(shot.src, shot.caption));
      }
      galleryGrid.appendChild(item);
    });
  }

  galleryModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeGallery() {
  galleryModal.classList.remove('open');
  galleryGrid.innerHTML = '';
  document.body.style.overflow = '';
}

function openLightbox(src, caption) {
  lightboxImg.src = src;
  lightboxImg.alt = caption;
  lightboxCap.textContent = caption;
  lightbox.classList.add('open');
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxImg.src = '';
}

galleryClose.addEventListener('click', closeGallery);
galleryModal.addEventListener('click', e => { if (e.target === galleryModal) closeGallery(); });
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (lightbox.classList.contains('open')) closeLightbox();
    else if (galleryModal.classList.contains('open')) closeGallery();
  }
});


// Scroll to top
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
}, {passive:true});
scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({top:0, behavior:'smooth'});
});

// Copy email
const copyEmailBtn = document.getElementById('copyEmailBtn');
const copyBtnText  = document.getElementById('copyBtnText');
copyEmailBtn.addEventListener('click', () => {
  navigator.clipboard.writeText('anmolchaudhary8213@gmail.com').then(() => {
    copyBtnText.textContent = 'Copied!';
    copyEmailBtn.classList.add('copied');
    setTimeout(() => {
      copyBtnText.textContent = 'Copy';
      copyEmailBtn.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    /* fallback for older browsers */
    const el = document.createElement('textarea');
    el.value = 'anmolchaudhary8213@gmail.com';
    el.style.position = 'absolute'; el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select(); document.execCommand('copy');
    document.body.removeChild(el);
    copyBtnText.textContent = 'Copied!';
    copyEmailBtn.classList.add('copied');
    setTimeout(() => {
      copyBtnText.textContent = 'Copy';
      copyEmailBtn.classList.remove('copied');
    }, 2000);
  });
});

// Scroll progress bar
const progressBar = document.getElementById('progressBar');
window.addEventListener('scroll', () => {
  const scrollTop    = window.scrollY;
  const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled     = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = scrolled + '%';
  progressBar.setAttribute('aria-valuenow', Math.round(scrolled));
}, {passive:true});

