// A bounded, decorative canvas: ambient drift with a soft pull toward the pointer.
(() => {
  const canvas = document.querySelector('.pointer-field');
  const context = canvas?.getContext('2d', { alpha: true });
  if (!context) return;
  const pause = document.querySelector('.motion-toggle');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const MAX_DOTS = 240, MAX_PIXELS = 2_500_000, RADIUS = 230, SPRING = 18;
  let width = 0, height = 0, frame = 0, lastTime = 0;
  let enabled = false, paused = false;
  let dots = [];
  const pointer = { active: false, x: 0, y: 0, targetX: 0, targetY: 0 };

  function drawable() { return enabled && !paused && !document.hidden; }
  function stop() { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
  function queue() {
    if (!frame && drawable()) frame = requestAnimationFrame(tick);
  }
  function paint() {
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#ffffff';
    context.globalAlpha = 0.55;
    context.beginPath();
    for (const dot of dots) {
      context.moveTo(dot.x + dot.size, dot.y);
      context.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
    }
    context.fill();
    context.globalAlpha = 1;
  }
  function tick(time) {
    frame = 0;
    if (!drawable()) { lastTime = 0; return; }
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.033) : 1 / 60;
    lastTime = time;
    const follow = 1 - Math.exp(-26 * dt);
    if (pointer.active) {
      pointer.x += (pointer.targetX - pointer.x) * follow;
      pointer.y += (pointer.targetY - pointer.y) * follow;
    }
    const decay = Math.exp(-SPRING * dt);
    const radius2 = RADIUS * RADIUS;
    for (const dot of dots) {
      dot.homeX += dot.driftX * dt;
      dot.homeY += dot.driftY * dt;
      // Wrap beyond the viewport so a returning dot never crosses the page.
      if (dot.homeX < -32 || dot.homeX > width + 32) {
        const shift = dot.homeX < -32 ? width + 64 : -width - 64;
        dot.homeX += shift;
        dot.x += shift;
      }
      if (dot.homeY < -32 || dot.homeY > height + 32) {
        const shift = dot.homeY < -32 ? height + 64 : -height - 64;
        dot.homeY += shift;
        dot.y += shift;
      }
      let targetX = dot.homeX, targetY = dot.homeY;
      if (pointer.active) {
        const dx = pointer.x - dot.homeX, dy = pointer.y - dot.homeY;
        const distance2 = dx * dx + dy * dy;
        if (distance2 < radius2) {
          const falloff = 1 - distance2 / radius2;
          const pull = 0.6 * falloff * falloff;
          targetX += dx * pull;
          targetY += dy * pull;
        }
      }
      const dx = dot.x - targetX, dy = dot.y - targetY;
      const sx = dot.vx + SPRING * dx, sy = dot.vy + SPRING * dy;
      dot.x = targetX + (dx + sx * dt) * decay;
      dot.y = targetY + (dy + sy * dt) * decay;
      dot.vx = (dot.vx - SPRING * sx * dt) * decay;
      dot.vy = (dot.vy - SPRING * sy * dt) * decay;
    }
    paint();
    queue();
  }
  function resetPointer() { pointer.active = false; }
  function resize() {
    if (!enabled) return;
    stop();
    width = document.documentElement.clientWidth;
    height = window.innerHeight;
    if (!width || !height) return;
    const scale = Math.min(window.devicePixelRatio || 1, 1.5,
      Math.sqrt(MAX_PIXELS / (width * height)));
    canvas.width = Math.max(1, Math.floor(width * scale));
    canvas.height = Math.max(1, Math.floor(height * scale));
    context.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    const count = Math.min(MAX_DOTS, Math.max(32, Math.round(width * height / 6000)));
    const columns = Math.ceil(Math.sqrt(count * width / height));
    const rows = Math.ceil(count / columns);
    let seed = 731;
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    dots = Array.from({ length: count }, (_, i) => {
      const x = ((i % columns) + 0.18 + random() * 0.64) * width / columns;
      const y = (Math.floor(i / columns) + 0.18 + random() * 0.64) * height / rows;
      const angle = random() * Math.PI * 2;
      const speed = 5 + random() * 9;
      return { homeX: x, homeY: y, x, y, vx: 0, vy: 0,
        driftX: Math.cos(angle) * speed, driftY: Math.sin(angle) * speed,
        size: 0.8 + random() * 0.85 };
    });
    resetPointer();
    paint();
    queue();
  }
  function configure() {
    enabled = !motion.matches;
    canvas.hidden = !enabled;
    if (pause) pause.hidden = !enabled;
    stop();
    resetPointer();
    if (enabled) resize();
    else { dots = []; context.clearRect(0, 0, width, height); }
  }
  pause?.addEventListener('click', () => {
    paused = !paused;
    pause.textContent = paused ? 'Resume background' : 'Pause background';
    pause.setAttribute('aria-pressed', String(paused));
    resetPointer();
    if (paused) stop();
    else queue();
  });
  document.addEventListener('pointermove', event => {
    if (!drawable() || event.pointerType !== 'mouse') return;
    pointer.targetX = event.clientX;
    pointer.targetY = event.clientY;
    if (!pointer.active) { pointer.x = event.clientX; pointer.y = event.clientY; }
    pointer.active = true;
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', resetPointer, { passive: true });
  document.addEventListener('pointercancel', resetPointer, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('blur', resetPointer);
  document.addEventListener('visibilitychange', () => {
    resetPointer();
    if (document.hidden) stop();
    else queue();
  });
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', configure);
  motion.addEventListener('change', configure);
  configure();
})();
