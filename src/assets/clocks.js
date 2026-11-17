// Native time zones handle daylight-saving rules; no clock API is required.
(() => {
  const root = document.querySelector('.world-clocks');
  if (!root) return;
  const rows = [...root.querySelectorAll('[data-clock-row]')];
  const pause = root.querySelector('.clock-pause');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const formatters = new Map();
  for (const time of root.querySelectorAll('[data-clock-zone]')) {
    const zone = time.dataset.clockZone;
    if (!formatters.has(zone)) formatters.set(zone, new Intl.DateTimeFormat('en-GB', {
      timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
    }));
  }
  const originals = rows.map(row => [...row.querySelector('.clock-group').children]);
  let timeNodes = [], timer = 0, resizeFrame = 0, visible = true, paused = false;

  function update() {
    clearTimeout(timer);
    timer = 0;
    const now = new Date();
    const values = new Map([...formatters].map(([zone, formatter]) => [zone, formatter.format(now)]));
    const iso = now.toISOString();
    for (const time of timeNodes) {
      time.textContent = values.get(time.dataset.clockZone);
      time.dateTime = iso;
    }
    if (visible && !document.hidden) timer = setTimeout(update, 1000 - Date.now() % 1000);
  }
  function sync() {
    root.classList.toggle('is-paused', paused || !visible || document.hidden);
    pause.setAttribute('aria-pressed', String(paused));
    root.querySelector('.clock-pause-label').textContent = paused ? 'Resume motion' : 'Pause motion';
    root.querySelector('.clock-pause-icon').textContent = paused ? '▶' : 'Ⅱ';
    if (visible && !document.hidden) update();
    else { clearTimeout(timer); timer = 0; }
  }
  function fit() {
    resizeFrame = 0;
    root.classList.remove('clocks-ready');
    rows.forEach((row, index) => {
      const track = row.querySelector('.clock-track');
      const group = track.firstElementChild;
      group.replaceChildren(...originals[index]);
      while (track.children.length > 1) track.lastElementChild.remove();
      if (!reduced.matches) {
        // Make one repeat at least as wide as the viewport, including ultrawide screens.
        let repeats = 0;
        while (group.getBoundingClientRect().width < row.clientWidth && repeats++ < 12) {
          for (const card of originals[index]) {
            const copy = card.cloneNode(true);
            copy.setAttribute('aria-hidden', 'true');
            group.append(copy);
          }
        }
        const duplicate = group.cloneNode(true);
        duplicate.setAttribute('aria-hidden', 'true');
        duplicate.setAttribute('data-clock-copy', '');
        track.append(duplicate);
      }
    });
    timeNodes = [...root.querySelectorAll('[data-clock-zone]')];
    pause.hidden = reduced.matches;
    update();
    root.classList.add('clocks-ready');
    sync();
  }
  pause.addEventListener('click', () => { paused = !paused; sync(); });
  window.addEventListener('resize', () => {
    if (!resizeFrame) resizeFrame = requestAnimationFrame(fit);
  }, { passive: true });
  reduced.addEventListener('change', fit);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', () => {
    clearTimeout(timer);
    cancelAnimationFrame(resizeFrame);
    timer = resizeFrame = 0;
  });
  window.addEventListener('pageshow', sync);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      sync();
    }, { rootMargin: '100px' });
    observer.observe(root);
  }
  fit();
})();

