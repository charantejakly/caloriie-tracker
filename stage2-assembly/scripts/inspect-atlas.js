import fs from 'node:fs';

const atlas = JSON.parse(fs.readFileSync('C:/ROS PROJECT/ct/C TRACKER/human-atlas-main/public/models/atlas.json', 'utf8'));

console.log('Version:', atlas.version);
console.log('Total parts:', atlas.parts.length);
console.log('Total chunks:', atlas.chunks.length);

const systems = {};
for (const p of atlas.parts) {
  systems[p.system] = (systems[p.system] || 0) + 1;
}
console.log('Systems breakdown:', systems);

const muscleParts = atlas.parts.filter(p => p.system === 'muscular');
console.log('Muscular parts count:', muscleParts.length);

// Sample part structure
console.log('Sample muscular part:', JSON.stringify(muscleParts[0], null, 2));
