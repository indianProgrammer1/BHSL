// A once-per-tab-session introduction. Storage or animation failures leave the page usable.
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches) return;
  try {
    if (sessionStorage.getItem('bhsl:intro:v1')) return;
    sessionStorage.setItem('bhsl:intro:v1', 'seen');
  } catch { return; }
  const root = document.documentElement;
  let overlay, revealTimer, finishTimer;
  function finish() {
    clearTimeout(revealTimer); clearTimeout(finishTimer);
    root.classList.remove('intro-pending', 'intro-reveal');
    overlay?.remove();
    motion.removeEventListener('change', finish);
    document.removeEventListener('keydown', finish);
    document.removeEventListener('pointerdown', finish);
  }
  function reveal() {
    clearTimeout(finishTimer);
    root.classList.remove('intro-pending');
    root.classList.add('intro-reveal');
    overlay?.classList.add('is-exiting');
    finishTimer = setTimeout(finish, 480);
  }
  root.classList.add('intro-pending');
  finishTimer = setTimeout(finish, 2200);
  motion.addEventListener('change', finish);
  document.addEventListener('keydown', finish, { once: true });
  document.addEventListener('pointerdown', finish, { once: true });
  document.addEventListener('DOMContentLoaded', () => {
    if (!root.classList.contains('intro-pending')) return;
    overlay = document.querySelector('.brand-intro');
    if (!overlay) { finish(); return; }
    overlay.hidden = false;
    revealTimer = setTimeout(reveal, 1100);
  }, { once: true });
})();
