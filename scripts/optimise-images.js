/**
 * Optimise the source images in src/site/images.
 *
 *   npm run images -- --dry-run    show what would change, touch nothing
 *   npm run images                 resize and re-encode in place
 *
 * Uses macOS sips, so there is nothing to install. It runs locally rather than
 * as part of `npm run build`, because the deploy host is Linux and has no sips.
 * Commit the optimised files and the host serves them as they are.
 *
 * Safe to run repeatedly: anything already at or below MAX_WIDTH is skipped, so
 * a JPEG is never re-encoded twice and never degrades further.
 *
 * Second phase: everything under images/case-studies is converted to WebP with
 * cwebp, the original is moved to /_masters/images/... and every reference in
 * src/site is rewritten. Transparency survives - cwebp encodes the alpha channel
 * losslessly even when the colour data is lossy. Icons and the root images folder
 * are deliberately left alone: apple-touch-icon and the favicons must stay PNG.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const IMAGE_DIR = path.join(__dirname, '..', 'src', 'site', 'images');
const MAX_WIDTH = 1600; // widest an image is ever displayed is ~850px, so this covers 2x screens
const QUALITY = 70;     // sips JPEG quality, 0 to 100

const dryRun = process.argv.includes('--dry-run');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).reduce((files, entry) => {
    const full = path.join(dir, entry.name);
    return files.concat(entry.isDirectory() ? walk(full) : [full]);
  }, []);
}

function widthOf(file) {
  const out = execFileSync('sips', ['-g', 'pixelWidth', file], { encoding: 'utf8' });
  const match = out.match(/pixelWidth:\s*(\d+)/);
  return match ? Number(match[1]) : null;
}

const kb = bytes => `${Math.round(bytes / 1024)}KB`;

try {
  execFileSync('which', ['sips'], { stdio: 'ignore' });
} catch (e) {
  console.error('sips not found. This script needs macOS. Images left untouched.');
  process.exit(1);
}

const images = walk(IMAGE_DIR).filter(f => /\.(jpe?g|png)$/i.test(f));
let before = 0;
let after = 0;
let changed = 0;

images.forEach(file => {
  const rel = path.relative(IMAGE_DIR, file);
  const startSize = fs.statSync(file).size;
  const width = widthOf(file);
  before += startSize;

  if (width === null || width <= MAX_WIDTH) {
    after += startSize;
    console.log(`  skip    ${rel.padEnd(46)} ${String(width).padStart(5)}px  ${kb(startSize)}`);
    return;
  }

  // Resize. JPEGs are re-encoded at QUALITY; PNGs keep their format so alpha survives.
  const args = ['-Z', String(MAX_WIDTH)];
  if (/\.jpe?g$/i.test(file)) {
    args.push('-s', 'format', 'jpeg', '-s', 'formatOptions', String(QUALITY));
  }

  if (dryRun) {
    // Convert a copy in the temp dir so the reported saving is real, not a guess.
    const probe = path.join(os.tmpdir(), `optimise-probe-${process.pid}${path.extname(file)}`);
    fs.writeFileSync(probe, fs.readFileSync(file));
    execFileSync('sips', args.concat([probe]), { stdio: 'ignore' });
    const probeSize = fs.statSync(probe).size;
    fs.unlinkSync(probe);
    after += probeSize;
    changed += 1;
    console.log(`  WOULD   ${rel.padEnd(46)} ${String(width).padStart(5)}px -> ${MAX_WIDTH}px  ${kb(startSize)} -> ${kb(probeSize)}`);
    return;
  }

  execFileSync('sips', args.concat([file]), { stdio: 'ignore' });

  const endSize = fs.statSync(file).size;
  after += endSize;
  changed += 1;
  console.log(`  done    ${rel.padEnd(46)} ${String(width).padStart(5)}px -> ${MAX_WIDTH}px  ${kb(startSize)} -> ${kb(endSize)}`);
});

const saved = before - after;
console.log('');
console.log(`  ${images.length} images, ${changed} ${dryRun ? 'would be resized' : 'resized'}`);
console.log(`  ${kb(before)} -> ${kb(after)}${saved > 0 ? `  (saved ${kb(saved)}, ${Math.round((saved / before) * 100)}%)` : ''}`);
if (dryRun) console.log('\n  Dry run. Re-run without --dry-run to apply.');


/* ---------------------------------------------------------------------------
   Phase two: convert the case study images to WebP and fix every reference.
   --------------------------------------------------------------------------- */

const CASE_DIR = path.join(IMAGE_DIR, 'case-studies');
const MASTER_DIR = path.join(__dirname, '..', '_masters', 'images');
const SITE_DIR = path.join(__dirname, '..', 'src', 'site');
const WEBP_QUALITY = 80;

function mkdirp(dir) {
  if (fs.existsSync(dir)) return;
  mkdirp(path.dirname(dir));
  fs.mkdirSync(dir);
}

function textFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).reduce((files, entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return files.concat(textFiles(full));
    return /\.(html|njk|md)$/i.test(entry.name) ? files.concat([full]) : files;
  }, []);
}

if (!fs.existsSync(CASE_DIR)) {
  console.log('\n  No case-studies folder, nothing to convert.');
  process.exit(0);
}

try {
  execFileSync('which', ['cwebp'], { stdio: 'ignore' });
} catch (e) {
  console.error('\n  cwebp not found, skipping the WebP step. Install it with: brew install webp');
  process.exit(0);
}

const candidates = walk(CASE_DIR).filter(f => /\.(jpe?g|png)$/i.test(f));

if (!candidates.length) {
  console.log('\n  WebP: nothing left to convert.');
} else {
  console.log('\n  Converting case study images to WebP');
  let wBefore = 0;
  let wAfter = 0;
  const renames = [];

  candidates.forEach(file => {
    const rel = path.relative(IMAGE_DIR, file);
    const startSize = fs.statSync(file).size;
    const out = file.replace(/\.(jpe?g|png)$/i, '.webp');

    execFileSync('cwebp', ['-quiet', '-q', String(WEBP_QUALITY), '-metadata', 'none', file, '-o', out]);

    const endSize = fs.statSync(out).size;
    wBefore += startSize;
    wAfter += endSize;

    // keep the original outside the build, alongside the video masters
    const master = path.join(MASTER_DIR, rel);
    mkdirp(path.dirname(master));
    fs.renameSync(file, master);

    renames.push([
      '/images/' + rel.split(path.sep).join('/'),
      '/images/' + path.relative(IMAGE_DIR, out).split(path.sep).join('/'),
    ]);

    console.log(`  webp    ${rel.padEnd(46)} ${kb(startSize)} -> ${kb(endSize)}`);
  });

  // rewrite every reference in the templates and pages
  let edited = 0;
  textFiles(SITE_DIR).forEach(f => {
    const before = fs.readFileSync(f, 'utf8');
    let after = before;
    renames.forEach(([from, to]) => {
      after = after.split(from).join(to);
      after = after.split(from.slice(1)).join(to.slice(1)); // relative form, no leading slash
    });
    if (after !== before) {
      fs.writeFileSync(f, after);
      edited += 1;
      console.log('  ref     ' + path.relative(SITE_DIR, f));
    }
  });

  const wSaved = wBefore - wAfter;
  console.log('');
  console.log(`  ${candidates.length} converted, ${edited} file(s) updated, originals moved to /_masters/images`);
  console.log(`  ${kb(wBefore)} -> ${kb(wAfter)}  (saved ${kb(wSaved)}, ${Math.round((wSaved / wBefore) * 100)}%)`);
}
