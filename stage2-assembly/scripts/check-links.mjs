import fs from 'node:fs';

async function main() {
  console.log('Fetching download page...');
  const dlPageRes = await fetch('https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html');
  const dlPageHtml = await dlPageRes.text();
  fs.writeFileSync('stage2-assembly/download_page.html', dlPageHtml);
  console.log('Saved download_page.html, length:', dlPageHtml.length);

  // Extract all file links
  const links = [...dlPageHtml.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
  const bp3dLinks = [...new Set(links.filter(l => l.includes('bodyparts3d') || l.endsWith('.txt') || l.endsWith('.zip') || l.endsWith('.tar.gz')))];
  console.log('Relevant download links:\n' + bp3dLinks.join('\n'));

  // Also check isa_element_parts.txt
  console.log('\nChecking isa_element_parts.txt...');
  const isaUrl = 'https://dbarchive.biosciencedbc.jp/data/bodyparts3d/20130619/isa_element_parts.txt';
  const isaRes = await fetch(isaUrl);
  if (isaRes.ok) {
    const text = await isaRes.text();
    fs.writeFileSync('stage2-assembly/isa_element_parts.txt', text);
    console.log('Saved isa_element_parts.txt, length in chars:', text.length);
    
    // Search for our target FMAs
    const targets = ['FMA13377', 'FMA13378', 'FMA13358', 'FMA13359', 'FMA9628', 'FMA13357'];
    const lines = text.split(/\r?\n/);
    console.log(`Total lines in isa_element_parts.txt: ${lines.length}`);
    for (const t of targets) {
      const matches = lines.filter(l => l.includes(t));
      console.log(`Matches for ${t} (${matches.length}):`);
      matches.slice(0, 5).forEach(m => console.log('  ' + m));
    }
  } else {
    console.log(`Failed to fetch isa_element_parts.txt: HTTP ${isaRes.status}`);
  }
}

main().catch(console.error);
