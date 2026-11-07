import fs from 'node:fs';

const files = [
  'stage2-assembly/isa_inclusion_relation_list.txt',
  'stage2-assembly/partof_inclusion_relation_list.txt'
];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split(/\r?\n/);
  console.log(`=== ${f} (${lines.length} lines) ===`);
  console.log('Header/Sample:', lines.slice(0, 5));
}
