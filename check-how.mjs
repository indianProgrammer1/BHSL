import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { sceneAt, stageProgress, clamp, followProgress, projectPoint } from '../src/assets/how-progress.js';
import { howStages, howPage } from '../src/how.mjs';

const expectedStages = ['Source Code', 'Preprocessing', 'Compilation', 'Assembly', 'Object File', 'Linking', 'Executable', 'Loading & Initialization', 'Execution & Output', 'Terminal Display'];
assert.deepEqual(howStages.map(stage => stage.title), expectedStages);
assert.deepEqual(howStages.map(stage => stage.phase), [...Array(7).fill('Build'), ...Array(3).fill('Run')]);
assert.equal((howPage.body.match(/data-layer="/g) || []).length, 10);
assert.equal((howPage.body.match(/data-caption="/g) || []).length, 10);
const flat = sceneAt(0), open = sceneAt(1);
assert.equal(flat.rotationX, 0);
assert.equal(Math.abs(flat.rotationZ), 0);
assert.equal(flat.depths[0], 0);
assert.equal(flat.reveal, 0);
assert.equal(open.spread, 1);
assert.equal(open.reveal, 1);
for (let index = 0; index < 10; index++) {
  assert.equal(sceneAt(stageProgress(index)).stage, index);
  if (index) assert.equal(open.depths[index - 1] - open.depths[index], 62);
}
let previous = flat;
const forward = [];
for (let step = 0; step <= 1000; step++) {
  const state = sceneAt(step / 1000);
  assert(state.spread >= previous.spread && state.tilt >= previous.tilt);
  assert(state.stage >= previous.stage);
  assert(state.depths.every(Number.isFinite));
  assert(state.rotationX < 65, 'The camera never becomes edge-on');
  if (step) assert(Math.abs(state.depths[9] - previous.depths[9]) < 3, 'Separation has no jumps');
  forward.push(state);
  previous = state;
}
for (let step = 1000; step >= 0; step--) assert.deepEqual(sceneAt(step / 1000), forward[step], 'Scroll reversal is deterministic');
assert.deepEqual(sceneAt(-1), flat);
assert.deepEqual(sceneAt(2), open);

assert.equal((howPage.body.match(/data-label="/g) || []).length, 10);
assert.equal((howPage.body.match(/data-leader="/g) || []).length, 10);
assert.equal((howPage.body.match(/data-anchor="/g) || []).length, 10);
assert.equal((howPage.body.match(/class="how-annotations"/g) || []).length, 1);
assert(open.offsets[0][0] < open.offsets[9][0], 'The plates form a diagonal stack');
function afterSecond(fps) { let value = 0; for (let i = 0; i < fps; i++) value = followProgress(value, 1, 1 / fps); return value; }
assert(Math.abs(afterSecond(60) - afterSecond(120)) < 0.00001, 'Damping is refresh-rate independent');
assert(Math.abs(afterSecond(120) - afterSecond(144)) < 0.00001);
assert(followProgress(0, 1, 1 / 120) > 0 && followProgress(0, 1, 1 / 120) < 0.2, 'Scroll jumps are interpolated');
assert.deepEqual(projectPoint(100, 100, 0, flat, 1, 500, 300, 1000, 600, 2000), [600, 400]);

// Exercise the shipped controller, including its demand-driven frame loop.
function node() {
  const classes = new Set();
  return { style: {}, hidden: false, textContent: '', events: {}, attrs: {}, dataset: {},
    classList: { add(name) { classes.add(name); }, toggle(name, on) { on ? classes.add(name) : classes.delete(name); }, contains(name) { return classes.has(name); } },
    addEventListener(type, callback) { this.events[type] = callback; },
    setAttribute(name, value) { this.attrs[name] = value; }, removeAttribute(name) { delete this.attrs[name]; } };
}
const layers = Array.from({ length: 10 }, node), captions = Array.from({ length: 10 }, node);
const labels = Array.from({ length: 10 }, node), paths = Array.from({ length: 10 }, node), dots = Array.from({ length: 10 }, node);
const segments = Array.from({ length: 20 }, node);
const buttons = Array.from({ length: 20 }, (_, index) => Object.assign(node(), { dataset: { goStage: String(index % 10) } }));
const pin = Object.assign(node(), { offsetHeight: 900 });
const viewport = Object.assign(node(), { clientWidth: 1153, clientHeight: 587 });
const object = node(), caption = node(), controls = node(), hint = node(), status = node(), label = node(), annotations = node(), leaders = node();
let layoutReads = 0;
const experience = Object.assign(node(), { offsetHeight: 9000, getBoundingClientRect() { layoutReads++; return { top: 94 - window.scrollY }; },
  querySelector(selector) { return { '.how-pin': pin, '.how-viewport': viewport, '.how-object': object, '.how-caption': caption, '.how-controls': controls, '.how-scroll-hint': hint, '[data-how-status]': status, '.how-scroll-label': label, '.how-annotations': annotations, '.how-leaders': leaders }[selector]; },
  querySelectorAll(selector) { return { '[data-layer]': layers, '[data-caption]': captions, '[data-go-stage]': buttons, '[data-label]': labels, '[data-leader]': paths, '[data-anchor]': dots, '[data-segment]': segments }[selector]; } });
const window = Object.assign(node(), { scrollY: 0, innerWidth: 1280, scrollTo({ top }) { this.scrollY = top; this.events.scroll(); } });
const document = Object.assign(node(), { hidden: false, querySelector: () => experience });
const preference = Object.assign(node(), { matches: false }), shortScreen = Object.assign(node(), { matches: false });
let frame = null, time = 0;
const controller = readFileSync(new URL('../src/assets/how.js', import.meta.url), 'utf8').replace(/^import[^\n]+\n/, '');
runInNewContext(controller, { clamp, sceneAt, stageProgress, followProgress, projectPoint, window, document,
  matchMedia: query => query.includes('reduced-motion') ? preference : shortScreen,
  requestAnimationFrame(callback) { assert(!frame, 'Only one animation frame is queued'); frame = callback; return 1; },
  cancelAnimationFrame() { frame = null; } });
function settle() { let count = 0; while (frame) { assert(count++ < 500, 'Animation settles and stops'); const callback = frame; frame = null; time += 1000 / 120; callback(time); } }
assert(object.style.transform.includes('rotateX(0deg)'));
assert.equal(caption.style.visibility, 'hidden');
const initialTransform = object.style.transform;
const initialReads = layoutReads;
for (let index = 0; index < 20; index++) {
  buttons[index].events.click(); settle();
  assert.equal(captions.filter(panel => !panel.hidden).length, 1);
  assert.equal(captions[index % 10].hidden, false);
  assert.equal(buttons[index].attrs['aria-current'], 'step');
  assert(layers[index % 10].classList.contains('is-active'));
  assert(labels[index % 10].classList.contains('is-active'));
}
assert.equal(layoutReads, initialReads, 'No geometry reads occur during animated frames');
window.scrollY = 0; window.events.scroll(); settle();
assert.equal(object.style.transform, initialTransform, 'Scrolling up restores the exact original window');
assert.equal(frame, null);
viewport.clientWidth = 350; viewport.clientHeight = 376; window.innerWidth = 390;
window.events.resize();
assert(!object.style.transform.includes('NaN'));
preference.matches = true; preference.events.change();
assert(experience.classList.contains('is-static'));
assert(hint.hidden);
const scrollBefore = window.scrollY;
buttons[9].events.click();
assert.equal(window.scrollY, scrollBefore, 'Reduced-motion selection does not scroll');
assert.equal(captions[9].hidden, false);
preference.matches = false; preference.events.change();
assert(!experience.classList.contains('is-static'));
shortScreen.matches = true; shortScreen.events.change();
assert(experience.classList.contains('is-static'));
shortScreen.matches = false; shortScreen.events.change();
buttons[8].events.click();
document.hidden = true; document.events.visibilitychange();
assert.equal(frame, null, 'Hidden tabs cancel scene rendering');
document.hidden = false; document.events.visibilitychange();
assert.equal(captions[8].hidden, false);
console.log('PASS: ten layers and leaders, diagonal geometry, refresh-independent smoothing, reverse scroll, all 20 controls, zero per-frame layout reads, idle/hidden suspension, mobile and reduced motion.');