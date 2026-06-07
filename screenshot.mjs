import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/s/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer');
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const OUT_DIR   = join(__dirname, 'temporary screenshots');

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] ? `-${process.argv[3]}` : '';

const n    = readdirSync(OUT_DIR).filter(f => f.endsWith('.png')).length + 1;
const file = join(OUT_DIR, `screenshot-${n}${label}.png`);

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

// Scroll through page to trigger IntersectionObserver reveals
await page.evaluate(async () => {
  const h = document.body.scrollHeight;
  for (let y = 0; y <= h; y += 300) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 40));
  }
  window.scrollTo(0, 0);
});
await new Promise(r => setTimeout(r, 600));

await page.screenshot({ path: file, fullPage: true });
await browser.close();

console.log('Saved:', file);
