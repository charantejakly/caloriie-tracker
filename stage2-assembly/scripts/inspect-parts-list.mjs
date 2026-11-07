import fs from 'node:fs';

const content = fs.readFileSync('stage2-assembly/isa_parts_list_e.txt', 'utf8');
const lines = content.split(/\r?\n/);
console.log('Total lines:', lines.length);
console.log('First 20 lines:');
lines.slice(0, 20).forEach(l => console.log(JSON.stringify(l)));
