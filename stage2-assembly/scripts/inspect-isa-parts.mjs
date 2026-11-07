import fs from 'node:fs';

const text = fs.readFileSync('stage2-assembly/isa_element_parts.txt', 'utf8');
const lines = text.split(/\r?\n/);
console.log(`Total lines in isa_element_parts.txt: ${lines.length}`);
console.log('First 5 lines:');
lines.slice(0, 5).forEach(l => console.log('  ', l));

const targets = ['FMA13377', 'FMA13378', 'FMA13358', 'FMA13359', 'FMA9628', 'FMA13357'];

for (const t of targets) {
  const matches = lines.filter(l => l.includes(t));
  console.log(`\nMatches for ${t} (${matches.length}):`);
  matches.forEach(m => console.log('  ', m));
}
