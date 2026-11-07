import fs from 'node:fs';

const text = fs.readFileSync('stage2-assembly/isa_element_parts.txt', 'utf8');
const lines = text.split(/\r?\n/);

console.log('Searching for abdominis...');
const abLines = lines.filter(l => /abdominis/i.test(l));
console.log(`Found ${abLines.length} lines containing abdominis:`);
abLines.slice(0, 10).forEach(l => console.log('  ', l));

console.log('Searching for latissimus...');
const latLines = lines.filter(l => /latissimus/i.test(l));
console.log(`Found ${latLines.length} lines containing latissimus:`);
latLines.slice(0, 10).forEach(l => console.log('  ', l));

console.log('Searching for rectus...');
const recLines = lines.filter(l => /rectus/i.test(l));
console.log(`Found ${recLines.length} lines containing rectus:`);
recLines.slice(0, 10).forEach(l => console.log('  ', l));
