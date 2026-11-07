import fs from 'node:fs';
import path from 'node:path';

function getFiles(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const p = path.join(dir, file.name);
      if (file.isDirectory()) {
        if (file.name === 'node_modules' || file.name === '.git' || file.name === '.gradle') continue;
        getFiles(p, fileList);
      } else {
        const stats = fs.statSync(p);
        fileList.push({ path: p, size: stats.size });
      }
    }
  } catch (e) {}
  return fileList;
}

const files = getFiles('c:/ROS PROJECT/ct/C TRACKER');
console.log(`Total non-node_modules files: ${files.length}`);

const largeFiles = files.filter(f => f.size > 10 * 1024 * 1024); // > 10MB
console.log('Files > 10MB:');
largeFiles.forEach(f => console.log(`  ${(f.size / (1024 * 1024)).toFixed(2)} MB: ${f.path}`));

const over50MB = files.filter(f => f.size > 50 * 1024 * 1024); // > 50MB
console.log('\nFiles > 50MB (critical for GitHub):');
over50MB.forEach(f => console.log(`  ${(f.size / (1024 * 1024)).toFixed(2)} MB: ${f.path}`));
