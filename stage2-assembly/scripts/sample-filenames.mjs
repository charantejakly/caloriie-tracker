import fs from 'node:fs';

const files = JSON.parse(fs.readFileSync('stage2-assembly/zip-files.json', 'utf8'));
console.log('Sample file names:');
files.slice(0, 20).forEach(f => console.log('  ', f.fileName));
console.log('Last 20 file names:');
files.slice(-20).forEach(f => console.log('  ', f.fileName));
