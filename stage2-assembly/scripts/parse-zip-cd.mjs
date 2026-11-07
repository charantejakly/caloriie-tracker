import fs from 'node:fs';

// A zip central directory record header signature is 0x02014b50
// End of central directory record signature is 0x06054b50

function parseZipCentralDirectory(buffer, rangeStart) {
  const files = [];
  let offset = 0;
  
  while (offset < buffer.length - 4) {
    if (buffer.readUInt32LE(offset) === 0x02014b50) {
      const compression = buffer.readUInt16LE(offset + 10);
      const compressedSize = buffer.readUInt32LE(offset + 20);
      const uncompressedSize = buffer.readUInt32LE(offset + 24);
      const fileNameLength = buffer.readUInt16LE(offset + 28);
      const extraFieldLength = buffer.readUInt16LE(offset + 30);
      const fileCommentLength = buffer.readUInt16LE(offset + 32);
      const localHeaderOffset = buffer.readUInt32LE(offset + 42);

      const fileName = buffer.toString('utf8', offset + 46, offset + 46 + fileNameLength);
      files.push({
        fileName,
        compressedSize,
        uncompressedSize,
        compression,
        localHeaderOffset
      });

      offset += 46 + fileNameLength + extraFieldLength + fileCommentLength;
    } else {
      offset++;
    }
  }

  return files;
}

if (fs.existsSync('stage2-assembly/tail.zip')) {
  const buf = fs.readFileSync('stage2-assembly/tail.zip');
  console.log(`tail.zip size: ${buf.length} bytes`);
  const files = parseZipCentralDirectory(buf, 141903898);
  console.log(`Parsed ${files.length} files from central directory!`);
  fs.writeFileSync('stage2-assembly/zip-files.json', JSON.stringify(files, null, 2));

  // Search for FMA or target keywords
  const targets = ['13377', '13378', '13358', '13359', 'rectus', 'abdominis', 'latissimus', 'dorsi'];
  for (const t of targets) {
    const hits = files.filter(f => f.fileName.toLowerCase().includes(t));
    console.log(`Target '${t}' matched ${hits.length} files:`);
    hits.forEach(h => console.log('  ', h.fileName, h.uncompressedSize));
  }
} else {
  console.log('tail.zip not yet downloaded.');
}
