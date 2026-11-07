import fs from 'node:fs';

const atlas = JSON.parse(fs.readFileSync('C:/ROS PROJECT/ct/C TRACKER/human-atlas-main/public/models/atlas.json', 'utf8'));

console.log('Concepts count:', atlas.concepts.length);
console.log('First 10 concepts:');
atlas.concepts.slice(0, 10).forEach(c => console.log('  ', c));

// Let's search for deltoid, pectoralis, trapezius, etc. in concepts
const terms = ['deltoid', 'pectoralis', 'trapezius', 'biceps', 'triceps', 'latissimus', 'rectus'];
for (const t of terms) {
  const matches = atlas.concepts.filter(c => c.name.toLowerCase().includes(t));
  console.log(`\nConcept matches for '${t}' (${matches.length}):`);
  matches.forEach(m => console.log('  ', m));
}
