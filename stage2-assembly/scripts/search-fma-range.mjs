import fs from 'node:fs';

const isaList = fs.readFileSync('stage2-assembly/isa_parts_list_e.txt', 'utf8').split(/\r?\n/);

console.log('Searching for FMA numbers around 13300-13400...');
const range = isaList.filter(l => {
  const m = l.match(/FMA(\d+)/);
  if (!m) return false;
  const num = parseInt(m[1]);
  return num >= 13300 && num <= 13400;
});
range.forEach(l => console.log('  ', l));
