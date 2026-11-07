import fs from 'node:fs';

const rel = fs.readFileSync('stage2-assembly/README_e.html', 'utf8');
const sec26 = rel.indexOf('2.6');
console.log(rel.slice(sec26, sec26 + 4000));
