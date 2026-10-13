/* =========================================================
   SCRIPT PRINCIPAL — !Anas Profile Page
   ========================================================= */

const CONFIG = {

  // Ton ID Discord (statut en direct via Lanyard)
  discordId: "664188939812208690",

  typewriterPhrases: [
    "en train de coder...",
    "me mp si besoin",
    "développeur",
    "!anas",
  ],

};

document.addEventListener('DOMContentLoaded', () => {

  initIntroScreen();
  initSoundToggle();
  initTypewriter();
  initDiscordStatus();

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

});


/* =========================================================
   ÉCRAN D'INTRO — CLICK TO ENTER
   ========================================================= */

function initIntroScreen() {

  const intro = document.getElementById('intro-screen');

  if (!intro) {
    document.body.classList.remove('intro-locked');
    return;
  }

  intro.addEventListener('click', () => {

    intro.classList.add('intro-hidden');
    document.body.classList.remove('intro-locked');

    // Ce clic est le geste utilisateur qui autorise le navigateur à lancer le son.
    document.dispatchEvent(new Event('site:unlock-sound'));

    setTimeout(() => intro.remove(), 800);

  }, { once: true });

}


/* =========================================================
   GESTION DU SON
   ========================================================= */

function initSoundToggle() {

  const soundBtn = document.getElementById('sound-toggle');
  const audio = document.getElementById('audio');

  if (!soundBtn || !audio) return;

  const icon = soundBtn.querySelector('i');

  let soundOn = true;

  audio.volume = 0.5;

  function updateIcon() {
    icon.classList.toggle('fa-volume-xmark', !soundOn);
    icon.classList.toggle('fa-volume-high', soundOn);
  }

  function applySoundState() {
    if (soundOn) audio.play().catch(() => {});
    else audio.pause();
  }

  updateIcon();

  document.addEventListener('site:unlock-sound', () => {
    if (soundOn) applySoundState();
  }, { once: true });

  soundBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    soundOn = !soundOn;
    applySoundState();
    updateIcon();
  });

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
   ========================================================= */

function initDiscordStatus() {

  const dot = document.getElementById('discord-status-dot');
  const avatarDot = document.getElementById('status-dot');
  const text = document.getElementById('discord-status-text');

  if (!dot || !text) return;

  const statusLabels = {
    online: 'En ligne',
    idle: 'Absent',
    dnd: 'Ne pas déranger',
    offline: 'Hors ligne',
  };

  function setStatus(status) {
    setStatusClass(dot, status);
    setStatusClass(avatarDot, status);
  }

  async function fetchStatus() {

    try {

      const res = await fetch(`https://api.lanyard.rest/v1/users/${CONFIG.discordId}`);
      const json = await res.json();

      if (!json.success) throw new Error('Utilisateur introuvable sur Lanyard');

      const data = json.data;
      const status = data.discord_status || 'offline';
      const activities = data.activities || [];

      setStatus(status);

      const customStatus = activities.find((a) => a.type === 4);
      const playing = activities.find((a) => a.type === 0);

      if (customStatus && customStatus.state) {
        text.textContent = customStatus.state;
      } else if (playing) {
        text.textContent = `Joue à ${playing.name}`;
      } else {
        text.textContent = statusLabels[status] || statusLabels.offline;
      }

    } catch (err) {

      text.textContent = 'Statut indisponible';
      setStatus('offline');

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
