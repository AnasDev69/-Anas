/* =========================================================
   SCRIPT PRINCIPAL — !Anas Profile Page (HUD noir & blanc)
   ========================================================= */

/* ---------------------------------------------------------
   CONFIGURATION — à personnaliser
   --------------------------------------------------------- */
const CONFIG = {
  // Ton ID Discord (mode développeur activé > clic droit sur ton profil > Copier l'ID).
  // Nécessite aussi d'avoir rejoint le serveur Lanyard : https://discord.gg/lanyard
  discordId: "664188939812208690",

  discordInvite: "https://discord.gg/MONLIEN",

  typewriterPhrases: [
    "EN TRAIN DE CODER...",
    "ME MP SI BESOIN",
    "DEVELOPPEUR",
    "!Anas",
  ],

  // Webhook Discord utilisé par le formulaire de contact
  discordWebhook: "https://discord.com/api/webhooks/1546820995283820554/jJEGQ00cdfuVe-Jy_nITlRZP8MarP0GZTcZ059H-eqeFyYUMTjAEr9FB8OvFMJgKodaB",
};

document.addEventListener('DOMContentLoaded', () => {
  initSoundToggle();
  initVisitorCounter();
  initParticles();
  initTypewriter();
  initDiscordStatus();
  initPageNavigation();
  initContactForm();
  document.getElementById('year').textContent = new Date().getFullYear();
});

/* =========================================================
   GESTION DU SON (vidéo de fond + musique)
   ========================================================= */
function initSoundToggle() {
  const soundBtn = document.getElementById('sound-toggle');
  const video = document.getElementById('bg-video');
  const audio = document.getElementById('audio');
  const icon = soundBtn.querySelector('i');

  // État VOULU par l'utilisateur (activé par défaut). Ne représente pas si le
  // son joue réellement à cet instant, seulement l'intention — c'est ce qui
  // permet au déblocage à la première interaction de fonctionner correctement.
  let soundOn = true;
  audio.volume = 0.5;

  function updateIcon() {
    icon.classList.toggle('fa-volume-xmark', !soundOn);
    icon.classList.toggle('fa-volume-high', soundOn);
  }

  function applySoundState() {
    if (soundOn) {
      video.muted = false;
      audio.play().catch(() => {
        // Bloqué par le navigateur (pas encore d'interaction) : on retentera
        // à la première interaction via le filet de sécurité ci-dessous.
      });
    } else {
      video.muted = true;
      audio.pause();
    }
  }

  updateIcon();
  applySoundState(); // tentative directe dès le chargement de la page

  // Filet de sécurité : les navigateurs bloquent le son tant qu'il n'y a pas
  // eu d'interaction sur la page. On écoute donc la toute première interaction,
  // peu importe sa nature, pour relancer le son automatiquement à ce moment-là.
  function unlockOnFirstInteraction() {
    if (soundOn && audio.paused) {
      applySoundState();
    }
  }
  const unlockEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
  unlockEvents.forEach((evt) => {
    document.addEventListener(evt, unlockOnFirstInteraction, { once: true, passive: true });
  });

  soundBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    soundOn = !soundOn;
    applySoundState();
    updateIcon();
  });
}

/* =========================================================
   COMPTEUR DE VISITEURS GLOBAL (CountAPI)
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
   PARTICULES (Canvas) — points blancs/noirs uniquement
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
   EFFET TYPEWRITER
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
   STATUT DISCORD EN DIRECT (Lanyard API)
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
   NAVIGATION MULTI-PAGES
   ========================================================= */
function initPageNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const pages = document.querySelectorAll('.page');

  function goToPage(pageName) {
    pages.forEach((page) => {
      page.classList.toggle('active', page.id === `page-${pageName}`);
    });
    tabs.forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.page === pageName);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => goToPage(tab.dataset.page));
  });

  const initialPage = window.location.hash.replace('#', '') || 'accueil';
  if (['accueil', 'projets', 'contact'].includes(initialPage)) {
    goToPage(initialPage);
  }
}

/* =========================================================
   FORMULAIRE DE CONTACT (mailto, sans backend)
   ========================================================= */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const statusEl = document.getElementById('contact-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const pseudo = document.getElementById('cf-pseudo').value.trim();
    const message = document.getElementById('cf-message').value.trim();
    if (!pseudo || !message) return;

    submitBtn.disabled = true;
    setStatus('ENVOI EN COURS...', '');

    try {
      const res = await fetch(CONFIG.discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [
            {
              title: 'Nouveau message — formulaire du site',
              color: 0xffffff,
              fields: [
                { name: 'Pseudo Discord', value: pseudo.slice(0, 256) },
                { name: 'Demande', value: message.slice(0, 1000) },
              ],
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });

      if (!res.ok) throw new Error('Réponse webhook invalide');

      form.reset();
      setStatus('MESSAGE ENVOYÉ ✓', 'success');
    } catch (err) {
      setStatus("ÉCHEC DE L'ENVOI, RÉESSAIE PLUS TARD", 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  function setStatus(text, type) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = 'contact-status' + (type ? ` ${type}` : '');
  }
}
