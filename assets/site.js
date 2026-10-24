'use strict';

// Keep the page usable if scripting, video playback or animation is unavailable.
document.documentElement.classList.add('js');
document.getElementById('year').textContent = new Date().getFullYear();

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.getElementById('main-navigation');
const mobileLayout = window.matchMedia('(max-width: 700px)');
menuButton.hidden = false;

function closeMenu(returnFocus = false) {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
  if (returnFocus) menuButton.focus();
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  navigation.classList.toggle('is-open', !isOpen);
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', (event) => {
  if (mobileLayout.matches && !event.target.closest('.site-header')) closeMenu();
});
mobileLayout.addEventListener('change', () => closeMenu());

const heroVideo = document.getElementById('hero-video');
const heroPlayback = document.getElementById('hero-playback');
const playbackLabel = heroPlayback.querySelector('.playback-label');
const playbackSymbol = heroPlayback.querySelector('.playback-symbol');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
heroPlayback.hidden = false;

function updateHeroControl() {
  const playing = !heroVideo.paused && !heroVideo.ended;
  playbackLabel.textContent = playing ? 'Pause film' : 'Play film';
  playbackSymbol.textContent = playing ? 'Ⅱ' : '▶';
  heroPlayback.setAttribute('aria-label', playing ? 'Pause shoe reconstruction video' : 'Play shoe reconstruction video');
}

function loadHero() {
  const source = heroVideo.querySelector('source');
  if (!source.hasAttribute('src')) {
    source.src = source.dataset.src;
    heroVideo.load();
  }
}

// Playback starts on request: no background download of the 4K video on page load.
heroPlayback.addEventListener('click', async () => {
  if (!heroVideo.paused) {
    heroVideo.pause();
    return;
  }
  loadHero();
  try {
    await heroVideo.play();
  } catch {
    heroVideo.controls = true;
    playbackLabel.textContent = 'Use video controls';
  }
});
heroVideo.addEventListener('play', updateHeroControl);
heroVideo.addEventListener('pause', updateHeroControl);
heroVideo.addEventListener('ended', updateHeroControl);
heroVideo.addEventListener('error', () => {
  playbackLabel.textContent = 'Open film ↗';
  heroPlayback.hidden = true;
  const fallback = document.createElement('a');
  fallback.className = 'film-control';
  fallback.href = 'media/video/shoe-reconstruction.mp4';
  fallback.textContent = 'Open film ↗';
  if (!document.querySelector('.stage-bottom a')) heroPlayback.after(fallback);
});

if ('IntersectionObserver' in window) {
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) heroVideo.pause();
  }, { threshold: 0.1 });
  visibilityObserver.observe(heroVideo);
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) heroVideo.pause();
});
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) heroVideo.pause();
});
updateHeroControl();

const films = {
  shoe: {
    title: 'Footwear reconstruction',
    src: 'media/video/shoe-reconstruction.mp4',
    poster: 'media/images/shoe-reconstruction.jpg'
  },
  ball: {
    title: 'Sports ball reconstruction',
    src: 'media/video/ball-reconstruction.mp4',
    poster: 'media/images/ball-reconstruction.jpg'
  }
};
const filmDialog = document.getElementById('film-dialog');
const dialogVideo = document.getElementById('dialog-video');
const filmTitle = document.getElementById('film-title');
const videoError = document.getElementById('video-error');
const videoDownload = document.getElementById('video-download');
let dialogTrigger = null;

function openFilm(key, trigger) {
  const film = films[key];
  if (!film) return;
  if (typeof filmDialog.showModal !== 'function') {
    window.location.assign(film.src);
    return;
  }
  dialogTrigger = trigger;
  heroVideo.pause();
  videoError.hidden = true;
  filmTitle.textContent = film.title;
  dialogVideo.poster = film.poster;
  dialogVideo.setAttribute('aria-label', film.title + ', recorded prototype output');
  dialogVideo.src = film.src;
  videoDownload.href = film.src;
  filmDialog.showModal();
  document.body.classList.add('modal-open');
  dialogVideo.play().catch(() => {
    // Native controls remain available if the browser requires another gesture.
  });
}

for (const trigger of document.querySelectorAll('[data-film]')) {
  trigger.hidden = false;
  trigger.addEventListener('click', () => openFilm(trigger.dataset.film, trigger));
}
function cleanUpFilm() {
  // Ignore a delayed close event if another film has already been opened.
  if (filmDialog.open) return;
  dialogVideo.pause();
  dialogVideo.removeAttribute('src');
  dialogVideo.load();
  document.body.classList.remove('modal-open');
  videoError.hidden = true;
  const previousTrigger = dialogTrigger;
  dialogTrigger = null;
  if (previousTrigger && previousTrigger.isConnected) previousTrigger.focus();
}

function closeFilm() {
  filmDialog.close();
  cleanUpFilm();
}

filmDialog.querySelector('.dialog-close').addEventListener('click', closeFilm);
filmDialog.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeFilm();
});
filmDialog.addEventListener('click', (event) => {
  if (event.target !== filmDialog) return;
  const bounds = filmDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeFilm();
});
filmDialog.addEventListener('close', cleanUpFilm);
dialogVideo.addEventListener('error', () => {
  if (filmDialog.open) videoError.hidden = false;
});

// Reveal content once on entry. Without motion support, everything stays visible.
const motionTargets = [...document.querySelectorAll(
  '.hero-topline, .hero h1, .hero-description, .hero-actions, .hero-footnote, ' +
  '.hero-feature, .section-kicker, section h2, .section-intro, .work-item, ' +
  '.use-row, .process-step, .progress-fact, .vision-copy > p, .vision-timeline, ' +
  '.team-member, .faq-list, .contact-copy'
)];
let revealObserver = null;

function configureReveals() {
  document.documentElement.classList.remove('motion-ready');
  if (revealObserver) revealObserver.disconnect();
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    motionTargets.forEach(element => element.classList.add('is-visible'));
    return;
  }
  revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
  for (const element of motionTargets) {
    element.classList.add('motion-item');
    if (element.matches('.work-item, .process-step, .team-member')) {
      const peers = [...element.parentElement.children];
      element.style.setProperty('--reveal-delay', Math.min(peers.indexOf(element), 2) * 70 + 'ms');
    }
    revealObserver.observe(element);
  }
  document.documentElement.classList.add('motion-ready');
}
configureReveals();
reducedMotion.addEventListener('change', configureReveals);

// Small, bounded perspective changes on fine pointers only. No motion on touch.
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const depthSurfaces = [...document.querySelectorAll('[data-depth]')];
for (const surface of depthSurfaces) {
  let bounds = null;
  let frame = 0;
  let position = { x: 0, y: 0 };
  const resetDepth = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    bounds = null;
    surface.style.removeProperty('--tilt-x');
    surface.style.removeProperty('--tilt-y');
  };
  surface.addEventListener('pointermove', event => {
    if (reducedMotion.matches || !finePointer.matches || event.pointerType === 'touch') return;
    bounds ||= surface.getBoundingClientRect();
    position = {
      x: Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1)),
      y: Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1))
    };
    if (frame) return;
    frame = requestAnimationFrame(() => {
      surface.style.setProperty('--tilt-x', (-position.y * 2).toFixed(2) + 'deg');
      surface.style.setProperty('--tilt-y', (position.x * 3).toFixed(2) + 'deg');
      frame = 0;
    });
  });
  surface.addEventListener('pointerleave', resetDepth);
  window.addEventListener('blur', resetDepth);
  window.addEventListener('scroll', resetDepth, { passive: true });
  reducedMotion.addEventListener('change', resetDepth);
  finePointer.addEventListener('change', resetDepth);
}
