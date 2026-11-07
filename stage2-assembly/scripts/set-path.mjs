const gitDir = 'C:\\Users\\chara\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\\cmd';
import { execSync } from 'node:child_process';

try {
  const currentPath = execSync('powershell -Command "[Environment]::GetEnvironmentVariable(\'Path\', \'User\')"', { encoding: 'utf8' }).trim();
  if (!currentPath.includes('Git.MinGit')) {
    const newPath = currentPath ? `${currentPath};${gitDir}` : gitDir;
    execSync(`powershell -Command "[Environment]::SetEnvironmentVariable('Path', '${newPath}', 'User')"`);
    console.log('Successfully added Git to User PATH!');
  } else {
    console.log('Git already in User PATH.');
  }
} catch (err) {
  console.error(err);
}

