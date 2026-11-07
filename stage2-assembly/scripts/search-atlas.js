import fs from 'node:fs';

const atlas = JSON.parse(fs.readFileSync('C:/ROS PROJECT/ct/C TRACKER/human-atlas-main/public/models/atlas.json', 'utf8'));

const targets = ['FMA13377', 'FMA13378', 'FMA13358', 'FMA13359', 'FMA9628', 'FMA13357', '13377', '13378', '13358', '13359'];

console.log('Searching in atlas.concepts...');
for (const c of atlas.concepts) {
  if (targets.includes(c.id) || targets.some(t => c.name?.toLowerCase().includes('abdominis') || c.name?.toLowerCase().includes('latissimus'))) {
    console.log('Found concept:', c);
  }
}

console.log('Searching in atlas.parts...');
for (const p of atlas.parts) {
  if (targets.includes(p.conceptId) || targets.includes(p.id) || targets.some(t => p.name?.toLowerCase().includes('rectus abdominis') || p.name?.toLowerCase().includes('latissimus'))) {
    console.log('Found part:', p);
  }
}
