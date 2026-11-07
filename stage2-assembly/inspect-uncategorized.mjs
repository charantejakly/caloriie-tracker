import fs from 'node:fs';

const inv = JSON.parse(fs.readFileSync('stage2-assembly/atlas-muscle-inventory.json', 'utf8'));

console.log(`Total uncategorized parts: ${inv.uncategorized.length}`);
console.log('Sample of uncategorized muscle names:');
inv.uncategorized.slice(0, 30).forEach(p => console.log(`  [${p.id}] ${p.name} (${p.conceptId})`));

// Group uncategorized by common body regions
const regions = {
  head_face_neck: /eye|auricular|nasalis|orbicularis|zygomaticus|buccinator|masseter|temporalis|pterygoid|tongue|palatoglossus|hyoglossus|genioglossus|styloglossus|pharyngeal|laryngeal|cricothyroid|arytenoid|thyrohyoid|sternohyoid|sternothyroid|omohyoid|mylohyoid|geniohyoid|digastric|stylohyoid|scalenus|longus capitis|longus colli/i,
  hand_foot_intrinsic: /lumbrical|interosseus|palmaris brevis|adductor pollicis|abductor pollicis brevis|flexor pollicis brevis|opponens|abductor digiti minimi|flexor digiti minimi|quadratus plantae|abductor hallucis|flexor hallucis brevis|adductor hallucis/i,
  pelvic_perineal: /levator ani|coccygeus|sphincter|ischiocavernosus|bulbospongiosus|transversus perinei/i,
  thoracic_wall: /intercostal|subcostalis|transversus thoracis|levatores costarum|diaphragm/i
};

let matchedCount = 0;
for (const p of inv.uncategorized) {
  for (const [r, reg] of Object.entries(regions)) {
    if (reg.test(p.name)) {
      matchedCount++;
      break;
    }
  }
}
console.log(`\nUncategorized parts matching head/hand/foot/pelvic/thoracic intrinsic categories: ${matchedCount} / ${inv.uncategorized.length}`);
