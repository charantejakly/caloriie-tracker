import fs from 'node:fs';

const rel = fs.readFileSync('stage2-assembly/README_e.html', 'utf8');
const sec2 = rel.indexOf('2. Data Description');
console.log(rel.slice(sec2, sec2 + 4000));
