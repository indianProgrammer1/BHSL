import { clamp, sceneAt, stageProgress, followProgress, projectPoint } from './how-progress.js';

const experience = document.querySelector('.how-experience');
if (experience) {
  const pin = experience.querySelector('.how-pin');
  const viewport = experience.querySelector('.how-viewport');
  const object = experience.querySelector('.how-object');
  const layers = [...experience.querySelectorAll('[data-layer]')];
  const captions = [...experience.querySelectorAll('[data-caption]')];
  const caption = experience.querySelector('.how-caption');
  const annotations = experience.querySelector('.how-annotations');
  const labels = [...experience.querySelectorAll('[data-label]')];
  const paths = [...experience.querySelectorAll('[data-leader]')];
  const dots = [...experience.querySelectorAll('[data-anchor]')];
  const segments = [...experience.querySelectorAll('[data-segment]')];
  const controls = experience.querySelector('.how-controls');
  const buttons = [...experience.querySelectorAll('[data-go-stage]')];
  const hint = experience.querySelector('.how-scroll-hint');
  const status = experience.querySelector('[data-how-status]');
  const scrollLabel = experience.querySelector('.how-scroll-label');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const shortScreen = matchMedia('(max-height: 560px)');
  const staticMode = () => preference.matches || shortScreen.matches;
  let frame = 0, lastTime = 0, start = 0, distance = 1, active = -1, staticStage = 0;
  let width = 1, height = 1, small = false, target = 0, current = 0, visible = true;
  let initialScale = 1, finalScale = 1, labelX = 0, labelStart = 0, labelStep = 30;
  const perspective = 2000;
  let lastGeometry = '';

  function select(index) {
    if (index === active) return;
    active = index;
    layers.forEach((layer, i) => layer.classList.toggle('is-active', i === index));
    captions.forEach((panel, i) => { panel.hidden = i !== index; });
    labels.forEach((label, i) => label.classList.toggle('is-active', i === index));
    paths.forEach((path, i) => path.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    buttons.forEach(button => {
      if (Number(button.dataset.goStage) === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    status.textContent = `${index < 7 ? 'BUILD' : 'RUN'} / ${String(index + 1).padStart(2, '0')} OF 10`;
  }
  function paint(progress) {
    const state = sceneAt(staticMode() ? 0.34 : progress);
    select(staticMode() ? staticStage : state.stage);
    const labelText = staticMode() ? 'SELECT A LAYER' : progress < 0.34 ? 'SCROLL TO UNFOLD ↓' : progress > 0.94 ? 'SOURCE → SCREEN' : 'KEEP SCROLLING ↓';
    if (scrollLabel.textContent !== labelText) scrollLabel.textContent = labelText;
    const geometry = state.tilt + '/' + state.spread;
    if (geometry === lastGeometry) return;
    lastGeometry = geometry;
    const scale = initialScale + (finalScale - initialScale) * state.tilt;
    const cx = width * (0.5 - (small ? 0.18 : 0.14) * state.tilt), cy = height * 0.5;
    // Only transforms change geometry in the frame loop; no layout reads.
    object.style.transform = `translate(-50%, -50%) translate3d(${cx - width / 2}px,0,0) scale(${scale}) rotateX(${state.rotationX}deg) rotateY(${state.rotationY}deg) rotateZ(${state.rotationZ}deg)`;
    layers.forEach((layer, i) => {
      const [x, y] = state.offsets[i], z = state.depths[i];
      layer.style.transform = `translate3d(${x}px,${y}px,${z}px)`;
      const [px, py] = projectPoint(418 + x, 176 + y, z, state, scale, cx, cy, width, height, perspective);
      const endY = labelStart + i * labelStep;
      const dx = labelX - 12 - px, dy = endY - py;
      segments[i * 2].style.transform = `translate3d(${px}px,${py}px,0) rotate(${Math.atan2(dy, dx)}rad) scaleX(${Math.hypot(dx, dy) / 100})`;
      segments[i * 2 + 1].style.transform = `translate3d(${labelX - 12}px,${endY}px,0) scaleX(0.12)`;
      dots[i].style.transform = `translate3d(${px - 2.5}px,${py - 2.5}px,0)`;
    });
    annotations.style.opacity = state.reveal;
    annotations.style.visibility = state.reveal > 0.01 ? 'visible' : 'hidden';
    caption.style.opacity = state.reveal;
    caption.style.visibility = state.reveal > 0.01 ? 'visible' : 'hidden';
    hint.style.opacity = 1 - state.tilt;
    hint.hidden = staticMode() || progress > 0.23;
    select(staticMode() ? staticStage : state.stage);
  }
  function tick(time) {
    frame = 0;
    if (document.hidden || !visible) { lastTime = 0; return; }
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 1 / 60;
    lastTime = time;
    current = staticMode() ? target : followProgress(current, target, dt);
    paint(current);
    if (!staticMode() && current !== target) queue();
    else lastTime = 0;
  }
  function queue() { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(tick); }
  function onScroll() { target = clamp((window.scrollY - start) / distance); queue(); }
  function measure() {
    start = experience.getBoundingClientRect().top + window.scrollY;
    distance = Math.max(1, experience.offsetHeight - pin.offsetHeight);
    width = viewport.clientWidth;
    height = viewport.clientHeight;
    small = window.innerWidth <= 760;
    initialScale = Math.min((width - 24) / 840, (height - 38) / 400, 1);
    finalScale = Math.min(width * (small ? 0.50 : 0.60) / 1200, (height - 34) / 900, 0.85);
    labelX = Math.round(width * (small ? 0.65 : 0.76));
    labelStep = Math.min(small ? 27 : 36, (height - 58) / 9);
    labelStart = Math.round((height - labelStep * 9) / 2);
    labels.forEach((label, i) => { label.style.transform = `translate3d(${labelX + 12}px,${labelStart + i * labelStep}px,0) translateY(-50%)`; });
    target = clamp((window.scrollY - start) / distance);
    current = target;
    lastGeometry = '';
    lastTime = 0;
    paint(current);
  }
  function configure() { experience.classList.toggle('is-static', staticMode()); measure(); }
  buttons.forEach(button => button.addEventListener('click', () => {
    const index = Number(button.dataset.goStage);
    if (staticMode()) { staticStage = index; select(index); }
    else window.scrollTo({ top: start + distance * stageProgress(index), behavior: 'smooth' });
  }));
  experience.classList.add('is-enhanced');
  controls.hidden = false;
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('pageshow', measure);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
    else measure();
  });
  preference.addEventListener('change', configure);
  shortScreen.addEventListener('change', configure);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(pin);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) measure();
    else { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
  }).observe(experience);
  configure();
}
