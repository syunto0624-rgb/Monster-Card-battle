const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, 'dist', name), 'utf8');
const html = read('index.html')
  .replace('<link rel="stylesheet" href="style.css">', () => `<style>${read('style.css')}</style>`)
  .replace('<script src="engine.js"></script><script src="app.js"></script>', () => `<script>${read('engine.js')}</script><script>${read('app.js')}</script>`);
fs.writeFileSync(path.join(root, 'arcana-duel.html'), html, 'utf8');
console.log('arcana-duel.html を再生成しました。');
