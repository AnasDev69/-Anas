/* =========================================================
   SCRIPT PRINCIPAL — !Anas Profile Page (HUD noir & blanc)
   ========================================================= */

/* ---------------------------------------------------------
   CONFIGURATION — à personnaliser
   --------------------------------------------------------- */
const CONFIG = {
  // Ton ID Discord (mode développeur activé > clic droit sur ton profil > Copier l'ID).
  // Nécessite aussi d'avoir rejoint le serveur Lanyard : https://discord.gg/lanyard
  discordId: "TON_ID_DISCORD",

  discordInvite: "https://discord.gg/MONLIEN",

  typewriterPhrases: [
    "EN TRAIN DE CODER...",
    "DISPONIBLE",
    "DEVELOPPEUR",
    "TOUJOURS EN APPRENTISSAGE",
  ],
};

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initSoundToggle();
  initVisitorCounter();
  initCopyDiscord();
  initMusicPlayer();
  initParticles();
  initTypewriter();
  initDiscordStatus();
  initPageNavigation();
  initContactForm();
  document.getElementById('year').textContent = new Date().getFullYear();
});

/* =========================================================
   1) TOGGLE D'INVERSION (noir sur blanc / blanc sur noir)
   ========================================================= */
function initThemeToggle() {
  const btn = document.getElementById('invert-toggle');
  const saved = localStorage.getItem('site-theme') || 'dark';

  applyTheme(saved);

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('site-theme', next);
  });

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}

/* =========================================================
   2) GESTION DU SON (vidéo de fond + musique)
   ========================================================= */
function initSoundToggle() {
  const soundBtn = document.getElementById('sound-toggle');
  const video = document.getElementById('bg-video');
  const audio = document.getElementById('audio');
  const icon = soundBtn.querySelector('i');

  let soundOn = false;

  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    video.muted = !soundOn;

    if (!soundOn) {
      audio.pause();
      updatePlayIcon(false);
    }

    icon.classList.toggle('fa-volume-xmark', !soundOn);
    icon.classList.toggle('fa-volume-high', soundOn);
  });
}

/* =========================================================
   3) COMPTEUR DE VISITEURS GLOBAL (CountAPI)
   ========================================================= */
async function initVisitorCounter() {
  const countEl = document.getElementById('visitor-count');
  const namespace = (window.location.hostname || 'anas-profile-site').replace(/\./g, '-');
  const key = 'visitors';

  try {
    const res = await fetch(`https://api.countapi.xyz/hit/${namespace}/${key}`);
    if (!res.ok) throw new Error('CountAPI indisponible');
    const data = await res.json();
    animateCount(countEl, data.value);
  } catch (err) {
    let count = parseInt(localStorage.getItem('visitor-count-fallback') || '0', 10);
    count += 1;
    localStorage.setItem('visitor-count-fallback', count);
    animateCount(countEl, count);
  }
}

function animateCount(el, target) {
  let display = 0;
  const step = Math.max(1, Math.ceil(target / 40));
  const interval = setInterval(() => {
    display += step;
    if (display >= target) {
      display = target;
      clearInterval(interval);
    }
    el.textContent = display;
  }, 20);
}

/* =========================================================
   4) COPIER LE LIEN DISCORD
   ========================================================= */
function initCopyDiscord() {
  const copyBtn = document.getElementById('copy-discord');
  const toast = document.getElementById('toast');

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(CONFIG.discordInvite);
      showToast('LIEN DISCORD COPIÉ');
      copyBtn.classList.add('copied');
      const span = copyBtn.querySelector('span');
      const originalText = span.textContent;
      span.textContent = 'COPIÉ';

      setTimeout(() => {
        copyBtn.classList.remove('copied');
        span.textContent = originalText;
      }, 2000);
    } catch (err) {
      showToast('ÉCHEC DE LA COPIE');
    }
  });

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }
}

/* =========================================================
   5) LECTEUR DE MUSIQUE
   ========================================================= */
function initMusicPlayer() {
  const audio = document.getElementById('audio');
  const playBtn = document.getElementById('play-btn');
  const progress = document.getElementById('progress');
  const volume = document.getElementById('volume');

  audio.volume = volume.value;

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => {});
      updatePlayIcon(true);
    } else {
      audio.pause();
      updatePlayIcon(false);
    }
  });

  audio.addEventListener('timeupdate', () => {
    const percent = (audio.currentTime / audio.duration) * 100 || 0;
    progress.style.width = `${percent}%`;
  });

  volume.addEventListener('input', () => {
    audio.volume = volume.value;
  });
}

function updatePlayIcon(isPlaying) {
  const icon = document.querySelector('#play-btn i');
  if (!icon) return;
  icon.classList.toggle('fa-play', !isPlaying);
  icon.classList.toggle('fa-pause', isPlaying);
}

/* =========================================================
   6) PARTICULES (Canvas) — points blancs/noirs uniquement
   ========================================================= */
function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let width, height;

  function isLight() {
    return document.documentElement.getAttribute('data-theme') === 'light';
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = Math.floor((width * height) / 18000);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.4,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.15,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = isLight() ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';

    particles.forEach((p) => {
      ctx.beginPath();
      ctx.globalAlpha = p.alpha;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0 || p.x > width) p.dx *= -1;
      if (p.y < 0 || p.y > height) p.dy *= -1;
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  resize();
  createParticles();
  draw();
}

/* =========================================================
   7) EFFET TYPEWRITER
   ========================================================= */
function initTypewriter() {
  const el = document.getElementById('typewriter');
  const phrases = CONFIG.typewriterPhrases;
  if (!el || !phrases.length) return;

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const current = phrases[phraseIndex];

    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }

    setTimeout(tick, deleting ? 35 : 75);
  }

  tick();
}

/* =========================================================
   8) STATUT DISCORD EN DIRECT (Lanyard API)
   Représenté par la FORME de la bordure, jamais par une couleur :
   plein = en ligne / tirets = absent / double = ne pas déranger / fine = hors ligne
   ========================================================= */
function initDiscordStatus() {
  const dot = document.getElementById('discord-status-dot');
  const avatarDot = document.getElementById('status-dot');
  const text = document.getElementById('discord-status-text');
  if (!dot || !text) return;

  if (!CONFIG.discordId || CONFIG.discordId === 'TON_ID_DISCORD') {
    text.textContent = 'STATUT DISCORD NON CONFIGURÉ';
    setStatusClass(dot, 'offline');
    setStatusClass(avatarDot, 'offline');
    return;
  }

  const statusLabels = {
    online: 'EN LIGNE SUR DISCORD',
    idle: 'ABSENT',
    dnd: 'NE PAS DÉRANGER',
    offline: 'HORS LIGNE',
  };

  async function fetchStatus() {
    try {
      const res = await fetch(`https://api.lanyard.rest/v1/users/${CONFIG.discordId}`);
      const json = await res.json();
      if (!json.success) throw new Error('Utilisateur introuvable sur Lanyard');

      const data = json.data;
      const status = data.discord_status || 'offline';

      setStatusClass(dot, status);
      setStatusClass(avatarDot, status);

      const customStatus = (data.activities || []).find((a) => a.type === 4);
      const playing = (data.activities || []).find((a) => a.type === 0);

      if (customStatus && customStatus.state) {
        text.textContent = customStatus.state.toUpperCase();
      } else if (playing) {
        text.textContent = `JOUE À ${playing.name.toUpperCase()}`;
      } else {
        text.textContent = statusLabels[status] || statusLabels.offline;
      }
    } catch (err) {
      text.textContent = 'STATUT DISCORD INDISPONIBLE';
      setStatusClass(dot, 'offline');
      setStatusClass(avatarDot, 'offline');
    }
  }

  fetchStatus();
  setInterval(fetchStatus, 30000);
}

function setStatusClass(el, status) {
  if (!el) return;
  el.classList.remove('dot-online', 'dot-idle', 'dot-dnd', 'dot-offline');
  el.classList.add(`dot-${status}`);
}

/* =========================================================
   9) NAVIGATION MULTI-PAGES
   ========================================================= */
function initPageNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const pages = document.querySelectorAll('.page');
  const burgerBtn = document.getElementById('burger-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  function goToPage(pageName) {
    pages.forEach((page) => {
      page.classList.toggle('active', page.id === `page-${pageName}`);
    });
    tabs.forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.page === pageName);
    });
    mobileMenu.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => goToPage(tab.dataset.page));
  });

  if (burgerBtn) {
    burgerBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
  }

  const initialPage = window.location.hash.replace('#', '') || 'accueil';
  if (['accueil', 'projets', 'contact'].includes(initialPage)) {
    goToPage(initialPage);
  }
}

/* =========================================================
   10) FORMULAIRE DE CONTACT (mailto, sans backend)
   ========================================================= */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('cf-name').value;
    const subject = document.getElementById('cf-subject').value;
    const message = document.getElementById('cf-message').value;

    const mailto = `mailto:ton.email@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`De : ${name}\n\n${message}`)}`;
    window.location.href = mailto;
  });
}
