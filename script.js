/* =========================================================
   SCRIPT PRINCIPAL — !Anas Profile Page
   ========================================================= */

/* ---------------------------------------------------------
   ⚙️ CONFIGURATION — à personnaliser
   --------------------------------------------------------- */
const CONFIG = {
  // Ton ID Discord (clic droit sur ton profil > Copier l'ID, mode développeur activé).
  // Pour que le statut fonctionne, tu dois AUSSI avoir rejoint le serveur Lanyard :
  // https://discord.gg/lanyard  (sinon l'API ne peut pas te suivre)
  discordId: "TON_ID_DISCORD",

  // Lien Discord utilisé pour le bouton "copier"
  discordInvite: "https://discord.gg/MONLIEN",

  // Phrases affichées en effet machine à écrire
  typewriterPhrases: [
    "En train de coder...",
    "Disponible pour discuter",
    "Développeur passionné",
    "Toujours en train d'apprendre",
  ],
};

document.addEventListener('DOMContentLoaded', () => {
  initThemeSwitcher();
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
   1) SYSTEME DE THEMES (Dark / Blue / Purple)
   ========================================================= */
function initThemeSwitcher() {
  const dots = document.querySelectorAll('.theme-dot');
  const savedTheme = localStorage.getItem('site-theme') || 'dark';

  applyTheme(savedTheme);

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const theme = dot.dataset.theme;
      applyTheme(theme);
      localStorage.setItem('site-theme', theme);
    });
  });

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    dots.forEach((d) => d.classList.toggle('active', d.dataset.theme === theme));
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

    // La vidéo de fond peut être démutée si elle a une piste audio
    video.muted = !soundOn;

    // Si le son global est coupé, on met la musique en pause
    if (!soundOn) {
      audio.pause();
      updatePlayIcon(false);
    }

    icon.classList.toggle('fa-volume-xmark', !soundOn);
    icon.classList.toggle('fa-volume-high', soundOn);
  });
}

/* =========================================================
   3) COMPTEUR DE VISITEURS GLOBAL (CountAPI, gratuit, sans clé)
   Chaque visite (tous visiteurs confondus) incrémente un compteur
   partagé, stocké côté API et identifié par le nom de domaine.
   ========================================================= */
async function initVisitorCounter() {
  const countEl = document.getElementById('visitor-count');
  const namespace = (window.location.hostname || 'anas-profile-site').replace(/\./g, '-');
  const key = 'visitors';

  try {
    // "hit" incrémente et retourne le nouveau total en une seule requête
    const res = await fetch(`https://api.countapi.xyz/hit/${namespace}/${key}`);
    if (!res.ok) throw new Error('CountAPI indisponible');
    const data = await res.json();
    animateCount(countEl, data.value);
  } catch (err) {
    // Solution de secours locale si l'API est injoignable (ex: hors-ligne)
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
      showToast('Lien Discord copié !');
      copyBtn.classList.add('copied');
      const span = copyBtn.querySelector('span');
      const originalText = span.textContent;
      span.textContent = 'Copié !';

      setTimeout(() => {
        copyBtn.classList.remove('copied');
        span.textContent = originalText;
      }, 2000);
    } catch (err) {
      showToast("Impossible de copier le lien.");
    }
  });

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }
}

/* =========================================================
   5) LECTEUR DE MUSIQUE INTEGRE
   ========================================================= */
function initMusicPlayer() {
  const audio = document.getElementById('audio');
  const playBtn = document.getElementById('play-btn');
  const progress = document.getElementById('progress');
  const volume = document.getElementById('volume');

  audio.volume = volume.value;

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => {
        // Lecture bloquée par le navigateur tant qu'il n'y a pas d'interaction
      });
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
   6) PARTICULES ANIMEES EN ARRIERE-PLAN (Canvas)
   ========================================================= */
function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = Math.floor((width * height) / 18000); // densité adaptative
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

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
   7) EFFET TYPEWRITER (machine à écrire) sur le statut
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
        setTimeout(tick, 1800); // pause avant d'effacer
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
   Nécessite d'avoir rejoint https://discord.gg/lanyard
   et d'avoir renseigné CONFIG.discordId ci-dessus.
   ========================================================= */
function initDiscordStatus() {
  const dot = document.getElementById('discord-status-dot');
  const text = document.getElementById('discord-status-text');
  if (!dot || !text) return;

  if (!CONFIG.discordId || CONFIG.discordId === 'TON_ID_DISCORD') {
    text.textContent = 'Statut Discord non configuré';
    return;
  }

  const statusColors = {
    online: 'var(--success)',
    idle: 'var(--warning)',
    dnd: 'var(--danger)',
    offline: 'var(--offline)',
  };

  const statusLabels = {
    online: 'En ligne sur Discord',
    idle: 'Absent',
    dnd: 'Ne pas déranger',
    offline: 'Hors ligne',
  };

  async function fetchStatus() {
    try {
      const res = await fetch(`https://api.lanyard.rest/v1/users/${CONFIG.discordId}`);
      const json = await res.json();
      if (!json.success) throw new Error('Utilisateur introuvable sur Lanyard');

      const data = json.data;
      const status = data.discord_status || 'offline';

      dot.style.background = statusColors[status] || statusColors.offline;
      // On synchronise aussi le petit point sur l'avatar
      const avatarDot = document.getElementById('status-dot');
      if (avatarDot) avatarDot.style.background = statusColors[status] || statusColors.offline;

      // Priorité d'affichage : statut personnalisé > jeu en cours > statut général
      const customStatus = (data.activities || []).find((a) => a.type === 4);
      const playing = (data.activities || []).find((a) => a.type === 0);

      if (customStatus && customStatus.state) {
        text.textContent = customStatus.state;
      } else if (playing) {
        text.textContent = `Joue à ${playing.name}`;
      } else {
        text.textContent = statusLabels[status] || statusLabels.offline;
      }
    } catch (err) {
      text.textContent = 'Statut Discord indisponible';
      dot.style.background = statusColors.offline;
    }
  }

  fetchStatus();
  // Rafraîchit toutes les 30 secondes
  setInterval(fetchStatus, 30000);
}

/* =========================================================
   9) NAVIGATION MULTI-PAGES ("mode présentation")
   Accueil / Projets / Contact avec transition fluide
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

  // Menu burger (mobile)
  if (burgerBtn) {
    burgerBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
  }

  // Navigation directe via l'URL (#projets, #contact...)
  const initialPage = window.location.hash.replace('#', '') || 'accueil';
  if (['accueil', 'projets', 'contact'].includes(initialPage)) {
    goToPage(initialPage);
  }
}

/* =========================================================
   10) FORMULAIRE DE CONTACT (ouvre le client mail, sans backend)
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
