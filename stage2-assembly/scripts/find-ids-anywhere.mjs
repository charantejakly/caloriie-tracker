import fs from 'node:fs';

const files = fs.readdirSync('stage2-assembly');
console.log('Searching all files in stage2-assembly for 13377, 13378, 13358, 13359...');

for (const f of files) {
  if (!f.endsWith('.txt') && !f.endsWith('.html') && !f.endsWith('.json')) continue;
  const content = fs.readFileSync('stage2-assembly/' + f, 'utf8');
  for (const id of ['13377', '13378', '13358', '13359']) {
    if (content.includes(id)) {
      console.log(`FOUND ${id} in ${f}!`);
      const lines = content.split(/\r?\n/).filter(l => l.includes(id));
      lines.slice(0, 5).forEach(l => console.log('  ', l));
    }
  }
}
