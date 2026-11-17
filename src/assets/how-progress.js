// One continuous, reversible camera move. All distances are in local scene units.
export const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const ease = value => { const x = clamp(value); return x * x * x * (x * (x * 6 - 15) + 10); };
export const stageProgress = index => 0.34 + (clamp(index, 0, 9) + 0.5) * 0.061;
export const followProgress = (current, target, seconds) => Math.abs(target - current) < 0.000005 ? target : current + (target - current) * (1 - Math.exp(-seconds / 0.085));
export function sceneAt(progress) {
  const p = clamp(progress);
  const tilt = ease((p - 0.015) / 0.30);
  const spread = ease((p - 0.065) / 0.275);
  return {
    tilt, spread, rotationX: tilt * 48, rotationY: tilt * -8, rotationZ: tilt * -24,
    stage: clamp(Math.floor((p - 0.34) / 0.061), 0, 9),
    reveal: ease((p - 0.14) / 0.18),
    depths: Array.from({ length: 10 }, (_, i) => -i * 1.5 * (1 - spread) + (4.5 - i) * 62 * spread),
    offsets: Array.from({ length: 10 }, (_, i) => [(i - 4.5) * 38 * spread, (i - 4.5) * 12 * spread])
  };
}
// Matches CSS rotateX → rotateY → rotateZ and the viewport's perspective.
export function projectPoint(x, y, z, state, scale, cx, cy, width, height, perspective) {
  const rx = state.rotationX * Math.PI / 180, ry = state.rotationY * Math.PI / 180, rz = state.rotationZ * Math.PI / 180;
  const x1 = x * Math.cos(rz) - y * Math.sin(rz), y1 = x * Math.sin(rz) + y * Math.cos(rz);
  const x2 = x1 * Math.cos(ry) + z * Math.sin(ry), z2 = -x1 * Math.sin(ry) + z * Math.cos(ry);
  const y2 = y1 * Math.cos(rx) - z2 * Math.sin(rx), z3 = y1 * Math.sin(rx) + z2 * Math.cos(rx);
  const projection = perspective / (perspective - z3 * scale);
  return [width / 2 + (cx + x2 * scale - width / 2) * projection, height / 2 + (cy + y2 * scale - height / 2) * projection];
}
