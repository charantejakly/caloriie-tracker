import fs from 'node:fs';

const files = [
  'stage2-assembly/isa_inclusion_relation_list.txt',
  'stage2-assembly/partof_inclusion_relation_list.txt'
];

const queries = ['rectus', 'abdominis', 'latissimus', 'dorsi', '13377', '13378', '13358', '13359', '9628', '13357'];

for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  console.log(`\n--- Searching in ${f} ---`);
  for (const q of queries) {
    const hits = lines.filter(l => l.toLowerCase().includes(q.toLowerCase()));
    if (hits.length > 0) {
      console.log(`Query '${q}' found ${hits.length} matches:`);
      hits.forEach(h => console.log('  ', h));
    }
  }
}
