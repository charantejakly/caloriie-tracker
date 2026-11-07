import fs from 'node:fs';

const rel = fs.readFileSync('stage2-assembly/README_e.html', 'utf8');
console.log('README_e.html length:', rel.length);
console.log(rel.slice(0, 2000));
