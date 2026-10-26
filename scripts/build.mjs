import {cp,mkdir,readFile,stat} from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('dist',{recursive:true});
for(const path of ['index.html','src','assets'])await cp(path,`dist/${path}`,{recursive:true});
for(const name of ['hero','about','equipment','event'])assert.ok((await stat(`dist/assets/${name}.webp`)).size>1000,`Missing image ${name}`);
const html=await readFile('dist/index.html','utf8');assert.match(html,/건강니 치과/);
console.log('Build complete: dist/ · 4 original images verified.');
