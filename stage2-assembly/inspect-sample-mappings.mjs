import fs from 'node:fs';

const atlas = JSON.parse(fs.readFileSync('C:/ROS PROJECT/ct/C TRACKER/human-atlas-main/public/models/atlas.json', 'utf8'));
const muscleParts = atlas.parts.filter(p => p.system === 'muscular');

console.log(`Total muscular parts in Human Atlas: ${muscleParts.length}`);

// Let's inspect concepts mapping to these muscle parts
const conceptMap = new Map();
for (const c of atlas.concepts) {
  for (const elem of c.elements) {
    if (!conceptMap.has(elem)) conceptMap.set(elem, []);
    conceptMap.get(elem).push({ id: c.id, name: c.name });
  }
}

// Find side and mapping for canonical parent groups
const canonicalParentGroups = {
  chest: 'Chest',
  anterior_deltoids: 'Shoulders',
  lateral_deltoids: 'Shoulders',
  posterior_deltoids: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  abs: 'Abs',
  obliques: 'Obliques',
  traps_upper: 'Upper Back',
  traps_middle: 'Upper Back',
  traps_lower: 'Upper Back',
  lats: 'Upper Back',
  rhomboids: 'Upper Back',
  infraspinatus_teres: 'Upper Back',
  lower_back: 'Lower Back',
  glutes: 'Glutes',
  quadriceps: 'Quadriceps',
  hamstrings: 'Hamstrings',
  calves: 'Calves'
};

console.log('Sample mapped parts with concepts:');
const sampleElements = ['FJ1468', 'FJ1468M', 'FJ1467', 'FJ1467M', 'FJ1513', 'FJ1513M', 'FJ1446', 'FJ1446M', 'FJ1464', 'FJ1464M', 'FJ1512', 'FJ1512M', 'FJ1478', 'FJ1478M', 'FJ1477', 'FJ1477M'];
for (const el of sampleElements) {
  const part = muscleParts.find(p => p.id === el);
  const concepts = conceptMap.get(el) || [];
  console.log(`  [${el}] Part Name: "${part?.name}", Part Concept: "${part?.conceptId}", Concepts: ${JSON.stringify(concepts.map(c => `${c.id} (${c.name})`))}`);
}
