import fs from 'node:fs';

const atlas = JSON.parse(fs.readFileSync('C:/ROS PROJECT/ct/C TRACKER/human-atlas-main/public/models/atlas.json', 'utf8'));

// Filter muscular system parts
const muscleParts = atlas.parts.filter(p => p.system === 'muscular');
console.log(`Loaded ${muscleParts.length} muscular parts from atlas.json`);

// Define canonical parent groups
// Chest, Shoulders, Biceps, Triceps, Forearms, Abs, Obliques, Upper Back, Lower Back, Glutes, Quadriceps, Hamstrings, Calves

// Let's create an inventory of all muscle names and concept IDs
const inventory = muscleParts.map(p => ({
  id: p.id,
  name: p.name,
  conceptId: p.conceptId,
  vertexCount: p.vertexCount,
  indexCount: p.indexCount,
  chunk: p.chunk,
  bounds: p.bounds
}));

// Group muscles by broad keywords to see coverage
const keywordCategories = {
  chest: /pectoralis|subclavius|sternalis/i,
  deltoids_anterior: /clavicular part of.*deltoid/i,
  deltoids_lateral: /acromial part of.*deltoid/i,
  deltoids_posterior: /spinal part of.*deltoid/i,
  biceps: /biceps brachii|coracobrachialis|brachialis/i,
  triceps: /triceps brachii|anconeus/i,
  forearms: /pronator|supinator|brachioradialis|flexor carpi|extensor carpi|flexor digitorum|extensor digitorum|palmaris longus|abductor pollicis longus|extensor pollicis|extensor indicis|extensor digiti minimi/i,
  obliques: /external oblique|internal oblique|transversus abdominis/i,
  rectus_abdominis: /rectus abdominis|pyramidalis/i,
  trapezius_upper: /descending part of.*trapezius/i,
  trapezius_middle: /transverse part of.*trapezius/i,
  trapezius_lower: /ascending part of.*trapezius/i,
  upper_back_other: /rhomboid|levator scapulae|splenius|serratus posterior superior|supraspinatus|infraspinatus|teres minor|teres major|subscapularis/i,
  latissimus_dorsi: /latissimus/i,
  lower_back: /erector spinae|iliocostalis|longissimus|spinalis|multifidus|quadratus lumborum|serratus posterior inferior/i,
  glutes: /gluteus maximus|gluteus medius|gluteus minimus|tensor fasciae latae|piriformis|obturator|gemellus|quadratus femoris/i,
  quadriceps: /rectus femoris|vastus lateralis|vastus medialis|vastus intermedius|articularis genus/i,
  hamstrings: /biceps femoris|semitendinosus|semimembranosus/i,
  calves: /gastrocnemius|soleus|plantaris|popliteus|tibialis posterior|flexor hallucis longus|flexor digitorum longus|fibularis|peroneus|tibialis anterior|extensor digitorum longus|extensor hallucis longus/i
};

const categorized = {};
const uncategorized = [];

for (const part of inventory) {
  let matched = false;
  for (const [cat, regex] of Object.entries(keywordCategories)) {
    if (regex.test(part.name)) {
      if (!categorized[cat]) categorized[cat] = [];
      categorized[cat].push(part);
      matched = true;
      break;
    }
  }
  if (!matched) {
    uncategorized.push(part);
  }
}

console.log('\n--- Categorization Summary ---');
for (const [cat, items] of Object.entries(categorized)) {
  console.log(`${cat}: ${items.length} parts`);
}
console.log(`Uncategorized: ${uncategorized.length} parts`);

fs.writeFileSync('stage2-assembly/atlas-muscle-inventory.json', JSON.stringify({
  totalMuscularParts: muscleParts.length,
  categorizedCounts: Object.fromEntries(Object.entries(categorized).map(([k, v]) => [k, v.length])),
  categorized,
  uncategorized
}, null, 2));

console.log('Saved stage2-assembly/atlas-muscle-inventory.json');
