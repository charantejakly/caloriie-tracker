import fs from 'node:fs';

const m3d = JSON.parse(fs.readFileSync('C:/ROS PROJECT/ct/C TRACKER/muscles-3d-main/public/models/manifest.json', 'utf8'));

const ra = m3d.structures.find(s => s.id === 'rectus-abdominis');
const ld = m3d.structures.find(s => s.id === 'latissimus-dorsi');

console.log('rectus-abdominis in muscles-3d:', JSON.stringify(ra, null, 2));
console.log('latissimus-dorsi in muscles-3d:', JSON.stringify(ld, null, 2));
