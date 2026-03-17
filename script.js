// ===== Reduced Motion =====
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== Live clock in hero =====
const heroClock = document.getElementById('hero-clock');
if (heroClock) {
  const updateClock = () => {
    heroClock.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false });
  };
  updateClock();
  setInterval(updateClock, 1000);
}

// ===== Reveal on scroll =====
const sections = document.querySelectorAll('.content-section');
const revealOnScroll = () => {
  const triggerBottom = window.innerHeight * 0.88;
  sections.forEach((sec, i) => {
    const top = sec.getBoundingClientRect().top;
    if (top < triggerBottom) {
      if (prefersReduced) sec.classList.add('show');
      else setTimeout(() => sec.classList.add('show'), i * 100);
    }
  });
};
window.addEventListener('scroll', revealOnScroll, { passive: true });
window.addEventListener('load', revealOnScroll);

// ===== Mobile menu toggle =====
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', String(!expanded));
  });
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

// ===== Theme toggle (Sun/Moon) =====
const themeToggle = document.getElementById('theme-toggle');
const THEME_KEY = 'anmol-theme';
const applyTheme = (isLight) => {
  document.body.classList.toggle('light', isLight);
};
const saved = localStorage.getItem(THEME_KEY);
const preferLight = saved === 'light' || (saved === null && window.matchMedia('(prefers-color-scheme: light)').matches);
applyTheme(preferLight);
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isLight = !document.body.classList.contains('light');
    applyTheme(isLight);
    localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
  });
}

// ===== Typing animation =====
const phrases = ["Cybersecurity Engineer", "CTF player", "Penetration Tester"];
document.querySelectorAll(".intro").forEach(typedText => {
  let i = 0, j = 0, currentPhrase = "", isDeleting = false;
  const wait = 1500;
  function type() {
    if (i >= phrases.length) i = 0;
    const fullText = phrases[i];
    currentPhrase = isDeleting ? fullText.substring(0, j--) : fullText.substring(0, j++);
    typedText.textContent = currentPhrase;
    if (!isDeleting && currentPhrase === fullText) {
      setTimeout(() => { isDeleting = true; type(); }, wait); return;
    } else if (isDeleting && currentPhrase === "") {
      isDeleting = false; i++; j = 0;
    }
    setTimeout(type, isDeleting ? 50 : 100);
  }
  type();
});

// ===== Custom cursor =====
const cursor = document.querySelector('.cursor');
const allowLens = window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReduced;
if (cursor && allowLens) {
  window.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top  = `${e.clientY}px`;
  }, { passive: true });
  const targets = document.querySelectorAll('a, button, .resume-btn, [role="button"]');
  targets.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('lens-on'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('lens-on'));
  });
} else if (cursor) {
  cursor.style.display = 'none';
}

// ===== Scroll spy =====
const spyLinks = [...document.querySelectorAll('a[data-spy]')];
const spyMap   = new Map(spyLinks.map(a => [a.getAttribute('href'), a]));
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const id   = `#${entry.target.id}`;
    const link = spyMap.get(id);
    if (!link) return;
    if (entry.isIntersecting) {
      spyLinks.forEach(l => { l.classList.remove('active'); l.removeAttribute('aria-current'); });
      link.classList.add('active');
      link.setAttribute('aria-current', 'true');
    }
  });
}, { rootMargin: '-50% 0px -45% 0px', threshold: 0.01 });
sections.forEach(sec => observer.observe(sec));

// ===== Header scroll state =====
const header = document.querySelector('header');
const onScroll = () => {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 10);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== Close menu on outside click / Esc =====
const closeMenu = () => {
  if (!hamburger || !navLinks) return;
  navLinks.classList.remove('active');
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
};
document.addEventListener('click', (e) => { if (header && !header.contains(e.target)) closeMenu(); }, { passive: true });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

// ===== Skill card reveal =====
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card");
  const cardObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("show"); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.15 });
  cards.forEach(card => cardObserver.observe(card));
});

// ===== Project Modal =====
class ProjectModalScrollAll {
  constructor() {
    this.body    = document.body;
    this.overlay = document.createElement('div');
    this.overlay.classList.add('project-overlay');
    this.body.appendChild(this.overlay);
    this.modal = document.createElement('div');
    this.modal.classList.add('project-modal-scroll-all');
    this.overlay.appendChild(this.modal);
    this.overlay.addEventListener('click', (e) => { if (e.target === this.overlay) this.close(); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.close(); });
  }
  open(projectData) {
    this.modal.innerHTML = '';
    projectData.media.forEach(item => {
      if (!item.src) return;
      const mediaEl = item.type === 'image' ? document.createElement('img') : document.createElement('video');
      mediaEl.src = item.src; mediaEl.classList.add('scroll-all-media'); mediaEl.loading = 'lazy';
      if (item.type === 'video') mediaEl.controls = true;
      mediaEl.alt = `${projectData.title} media`;
      this.modal.appendChild(mediaEl);
    });
    const title = document.createElement('h2');
    title.textContent = projectData.title;
    this.modal.appendChild(title);
    const desc = document.createElement('div');
    desc.classList.add('scroll-all-desc');
    desc.textContent = projectData.description;
    this.modal.appendChild(desc);
    if (projectData.repo) {
      const repoLink = document.createElement('a');
      repoLink.href = projectData.repo; repoLink.target = '_blank'; repoLink.rel = 'noopener';
      repoLink.classList.add('repo-link'); repoLink.textContent = '$ view_repository';
      this.modal.appendChild(repoLink);
    }
    this.overlay.classList.add('visible');
    this.body.style.overflow = 'hidden';
  }
  close() {
    this.overlay.classList.remove('visible');
    this.body.style.overflow = '';
  }
}

const projects = [
  {
    title: 'Secure Password Vault',
    description: 'AES-256 encryption with PBKDF2 key derivation.\nDetailed audit logs, key rotation.\nZeroization for security.\nFull Java implementation with GUI.',
    repo: 'https://github.com/ianmol13/Subdomain_enumeration_tool',
    media: [{ type: 'image', src: '' }, { type: 'image', src: '' }]
  },
  {
    title: 'Subdomain Enumeration Tool',
    description: 'Python-based OSINT tool using APIs like crt.sh and Sublist3r.\nScans 500+ subdomains/hour with multithreading.\nExport results to CSV for reporting.',
    repo: 'https://github.com/ianmol13/Subdomain_enumeration_tool',
    media: [{ type: 'image', src: 'Screenshot 2025-12-08 123032.png' }]
  },
  {
    title: 'Personal Portfolio Website',
    description: 'Responsive portfolio using HTML, CSS, and JavaScript.\nShowcases projects, skills, and contact info.\nDeployed on GitHub Pages with terminal theme.',
    repo: 'https://github.com/ianmol13/ianmol13.github.io',
    media: [{ type: 'image', src: '' }]
  }
];

const projectModal = new ProjectModalScrollAll();
document.querySelectorAll('.project-card').forEach((card, i) => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', (e) => {
    if (e.target.closest('a')) return; // don't intercept btn-link clicks
    projectModal.open(projects[i]);
  });
});

// ===== IEEE Slideshow =====
const slides = document.querySelectorAll('.image-slide img');
let currentSlide = 0;
function showSlide(index) {
  slides.forEach((img, i) => img.classList.toggle('active', i === index));
  currentSlide = index;
}
function slideNext() { showSlide((currentSlide + 1) % slides.length); }
function slidePrev() { showSlide((currentSlide - 1 + slides.length) % slides.length); }
if (slides.length) showSlide(0);

// ===== 3D SKILL CUBE =====
(function(){
  const cube = document.getElementById('cube');
  const scene = document.getElementById('scene');
  if(!cube || !scene) return;

  let rx = -18, ry = 28, auto = true, drag = false, lx = 0, ly = 0;

  const snaps = {
    front:  {x:-18, y:0},
    back:   {x:-18, y:180},
    right:  {x:-18, y:-90},
    left:   {x:-18, y:90},
    top:    {x:-88, y:28},
    bottom: {x:88,  y:28}
  };

  function apply(){ cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; }

  (function loop(){
    if(auto && !drag){ ry += 0.28; apply(); }
    requestAnimationFrame(loop);
  })();

  window.toggleCubeAuto = function(btn){
    auto = !auto;
    btn.classList.toggle('auto-on', auto);
    btn.textContent = auto ? '⟳ rotate' : '⟳ paused';
  };

  window.cubeSnap = function(face){
    auto = false;
    const btn = document.getElementById('cube-btn-auto');
    btn.classList.remove('auto-on'); btn.textContent = '⟳ paused';
    const t = snaps[face], sy = ry, sx = rx;
    const ty = t.y + Math.round((ry - t.y) / 360) * 360;
    let p = 0;
    (function step(){
      p += 0.045;
      const e = 1 - Math.pow(1 - Math.min(p,1), 4);
      rx = sx + (t.x - sx) * e;
      ry = sy + (ty - sy) * e;
      apply();
      if(p < 1) requestAnimationFrame(step);
    })();
  };

  scene.addEventListener('mousedown', e => {
    drag = true; lx = e.clientX; ly = e.clientY;
    auto = false;
    const btn = document.getElementById('cube-btn-auto');
    btn.classList.remove('auto-on'); btn.textContent = '⟳ paused';
  });
  window.addEventListener('mousemove', e => {
    if(!drag) return;
    ry += (e.clientX - lx) * .45;
    rx -= (e.clientY - ly) * .45;
    rx = Math.max(-88, Math.min(88, rx));
    apply(); lx = e.clientX; ly = e.clientY;
  });
  window.addEventListener('mouseup', () => drag = false);
  scene.addEventListener('touchstart', e => {
    drag = true; lx = e.touches[0].clientX; ly = e.touches[0].clientY; auto = false;
  }, {passive:true});
  scene.addEventListener('touchmove', e => {
    if(!drag) return;
    ry += (e.touches[0].clientX - lx) * .45;
    rx -= (e.touches[0].clientY - ly) * .45;
    rx = Math.max(-88, Math.min(88, rx));
    apply(); lx = e.touches[0].clientX; ly = e.touches[0].clientY;
  }, {passive:true});
  scene.addEventListener('touchend', () => drag = false);

  const cubeData = {
    offensive: { title:'offensive security', num:'01', skills:['Penetration Testing','OSINT & Reconnaissance','Web Application Security','Network Security','Red Teaming','Phishing Detection'] },
    tools:     { title:'security tools',     num:'03', skills:['Kali Linux','Burp Suite','Nmap / Wireshark','Metasploit','OWASP ZAP','ffuf / Gobuster'] },
    languages: { title:'programming languages', num:'05', skills:['Python','Java','Bash Scripting','JavaScript','SQL','HTML / CSS'] },
    concepts:  { title:'security concepts', num:'04', skills:['OWASP Top 10','Cryptography','Incident Response','SIEM / IDS','SAST / SCA','PCI DSS'] },
    cloud:     { title:'cloud & os',        num:'02', skills:['Linux','Windows','AWS','Azure IAM','GCP Fundamentals','MySQL'] },
    achievements:{ title:'track record',    num:'06', skills:['TryHackMe — Top 15%','50+ Labs Completed','KPMG CTF 2025','Mastercard Simulation','Bronze League #1','IEEE Event Head'] }
  };

  window.openCubePanel = function(cat){
    const d = cubeData[cat]; if(!d) return;
    document.getElementById('cp-title').textContent = d.title;
    document.getElementById('cp-num').textContent = d.num + ' / 06';
    document.getElementById('cube-face-id').textContent = 'face ' + d.num + ' / 06';
    document.getElementById('cube-status-txt').textContent = d.title + ' — expanded';
    document.getElementById('sk-grid').innerHTML = d.skills.map((s,i) => `
      <div class="sk">
        <span class="sk-num">${String(i+1).padStart(2,'0')}</span>
        <span class="sk-name">${s}</span>
        <div class="sk-dot"></div>
      </div>
    `).join('');
    document.getElementById('cube-panel').classList.add('open');
  };

  window.closeCubePanel = function(){
    document.getElementById('cube-panel').classList.remove('open');
    document.getElementById('cube-status-txt').textContent = 'drag to rotate · click any face to expand';
    document.getElementById('cube-face-id').textContent = '— / 06';
  };
})();
