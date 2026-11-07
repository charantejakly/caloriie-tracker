import fs from 'node:fs';

const isaList = fs.readFileSync('stage2-assembly/isa_parts_list_e.txt', 'utf8').split(/\r?\n/);
const partofList = fs.readFileSync('stage2-assembly/partof_parts_list_e.txt', 'utf8').split(/\r?\n/);

console.log('--- Search in isa_parts_list_e.txt ---');
const muscles1 = isaList.filter(l => /muscle/i.test(l));
console.log(`Lines with 'muscle': ${muscles1.length}`);
muscles1.slice(0, 10).forEach(l => console.log('  ', l));

console.log('\n--- Search in partof_parts_list_e.txt ---');
const muscles2 = partofList.filter(l => /muscle/i.test(l));
console.log(`Lines with 'muscle': ${muscles2.length}`);
muscles2.slice(0, 10).forEach(l => console.log('  ', l));

console.log('\n--- Search for "dorsi" or "oblique" ---');
console.log('dorsi:', isaList.filter(l => /dorsi/i.test(l)));
console.log('oblique:', isaList.filter(l => /oblique/i.test(l)));
