// Preserve the supplied PNGs exactly. SVG viewBoxes frame the logo without
// resampling, tracing, or changing the original artwork.
import { readFile, writeFile } from 'node:fs/promises';

const [silver, black] = process.argv.slice(2);
if (!silver || !black) throw new Error('Provide the silver and black logo PNG paths.');
for (const [source, name, viewBox] of [
  [silver, 'silver', '121 67 274 274'],
  [black, 'black', '133 100 288 288'],
]) {
  const png = await readFile(source);
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="64" height="64"><title>BHSL</title><image width="${width}" height="${height}" href="data:image/png;base64,${png.toString('base64')}"/></svg>\n`;
  await writeFile(new URL(`../src/assets/bhsl-logo-${name}.svg`, import.meta.url), svg);
  console.log(`Imported BHSL ${name} logo (${width} × ${height} source).`);
}
