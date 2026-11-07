import fs from 'node:fs';

const files = [
  'stage2-assembly/isa_parts_list_e.txt',
  'stage2-assembly/partof_parts_list_e.txt',
  'stage2-assembly/partof_element_parts.txt',
  'stage2-assembly/isa_element_parts.txt'
];

const targets = ['FMA13377', 'FMA13378', 'FMA13358', 'FMA13359', 'FMA9628', 'FMA13357', 'rectus abdominis', 'latissimus dorsi', 'rectus_abdominis', 'latissimus_dorsi'];

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.log(`File not found: ${f}`);
    continue;
  }
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split(/\r?\n/);
  console.log(`\n=== Checking ${f} (${lines.length} lines) ===`);
  for (const t of targets) {
    const hits = lines.filter(l => l.toLowerCase().includes(t.toLowerCase()));
    if (hits.length > 0) {
      console.log(`  Target '${t}' matched ${hits.length} lines:`);
      hits.forEach(h => console.log('    ', h));
    }
  }
}
