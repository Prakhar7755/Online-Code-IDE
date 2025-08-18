import Critters from 'critters';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const htmlPath = join('dist', 'index.html');
const html = readFileSync(htmlPath, 'utf8');

const critters = new Critters({
  path: 'dist',
  logLevel: 'info',
});

const output = await critters.process(html);
writeFileSync(htmlPath, output);
console.log('✅ Inlined critical CSS');
