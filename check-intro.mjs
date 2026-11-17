import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const source = readFileSync(new URL('../src/assets/intro.js', import.meta.url), 'utf8');
function fixture({ reduced = false, stored = false, storageError = false, missing = false } = {}) {
  const classes = () => { const names = new Set(); return { add(...values) { values.forEach(value => names.add(value)); }, remove(...values) { values.forEach(value => names.delete(value)); }, contains(value) { return names.has(value); } }; };
  const listen = object => Object.assign(object, { events: {}, addEventListener(name, fn) { this.events[name] = fn; }, removeEventListener(name) { delete this.events[name]; } });
  const root = { classList: classes() };
  const overlay = { hidden: true, classList: classes(), removed: false, remove() { this.removed = true; } };
  const document = listen({ documentElement: root, querySelector() { return missing ? null : overlay; } });
  const motion = listen({ matches: reduced });
  const timers = new Map(); let time = 0, id = 0;
  const storage = new Map(stored ? [['bhsl:intro:v1', 'seen']] : []);
  runInNewContext(source, { document, matchMedia: () => motion,
    sessionStorage: { getItem(key) { if (storageError) throw new Error('Blocked'); return storage.get(key); }, setItem(key, value) { storage.set(key, value); } },
    setTimeout(fn, delay) { const key = ++id; timers.set(key, { fn, due: time + delay }); return key; }, clearTimeout(key) { timers.delete(key); } });
  return { root, overlay, document, motion, timers, storage,
    advance(end) { while (timers.size) { const [key, timer] = [...timers].sort((a, b) => a[1].due - b[1].due)[0]; if (timer.due > end) break; time = timer.due; timers.delete(key); timer.fn(); } time = end; } };
}
let f = fixture();
assert(f.root.classList.contains('intro-pending'));
assert.equal(f.storage.get('bhsl:intro:v1'), 'seen');
f.document.events.DOMContentLoaded();
assert.equal(f.overlay.hidden, false);
f.advance(1100);
assert(!f.root.classList.contains('intro-pending'));
assert(f.root.classList.contains('intro-reveal'));
assert(f.overlay.classList.contains('is-exiting'));
f.advance(1580);
assert(f.overlay.removed && !f.root.classList.contains('intro-reveal'));
assert.equal(f.timers.size, 0);
for (const options of [{ reduced: true }, { stored: true }, { storageError: true }]) {
  f = fixture(options); assert(!f.root.classList.contains('intro-pending')); assert.equal(f.timers.size, 0);
}
f = fixture(); f.document.events.keydown(); f.document.events.DOMContentLoaded();
assert(!f.root.classList.contains('intro-pending') && f.overlay.hidden);
f = fixture(); f.document.events.DOMContentLoaded(); f.document.events.pointerdown(); assert(f.overlay.removed);
f = fixture(); f.document.events.DOMContentLoaded(); f.motion.events.change(); assert(f.overlay.removed);
f = fixture(); f.advance(2200); assert(!f.root.classList.contains('intro-pending'));
f = fixture({ missing: true }); f.document.events.DOMContentLoaded(); assert(!f.root.classList.contains('intro-pending'));
console.log('PASS: first-visit intro, session skip, reduced motion, storage denial, immediate input skip, and fail-open timing.');
