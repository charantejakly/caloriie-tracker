import fs from 'node:fs';

const rel = fs.readFileSync('stage2-assembly/README_e.html', 'utf8');
const sec28 = rel.indexOf('<h4><a name="2.8">');
console.log(rel.slice(sec28, sec28 + 3000));
