import fs from 'node:fs';

const rel = fs.readFileSync('stage2-assembly/release_4.0_e.html', 'utf8');
console.log('release_4.0_e.html length:', rel.length);
console.log(rel.slice(0, 1500));
