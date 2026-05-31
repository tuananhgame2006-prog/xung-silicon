const fs = require('fs');
const path = require('path');

const root = 'e:\\wedsod';
const webDir = path.join(root, 'web_nhip_dap_cong_nghe');
const botDir = path.join(root, 'bot_seo');

// Create directories
if (!fs.existsSync(webDir)) fs.mkdirSync(webDir);
if (!fs.existsSync(botDir)) fs.mkdirSync(botDir);

// Items to keep in root
const keepInRoot = [
  '.git',
  'LICENSE',
  'README.md',
  'web_nhip_dap_cong_nghe',
  'bot_seo',
  'move_files.cjs',
  'E_drive',
  'push_seo.js',
  'push_seo.cjs'
];

// Move web files
const items = fs.readdirSync(root);
for (const item of items) {
  if (!keepInRoot.includes(item)) {
    const oldPath = path.join(root, item);
    const newPath = path.join(webDir, item);
    try {
      fs.renameSync(oldPath, newPath);
      console.log(`Moved: ${item} -> web_nhip_dap_cong_nghe/${item}`);
    } catch (err) {
      console.error(`Failed to move ${item}:`, err.message);
    }
  }
}

// Copy Bot SEO
console.log('Copying Bot SEO...');
const cp = require('child_process');
try {
  // Use robocopy to mirror the directory, excluding venv
  cp.execSync(`robocopy "E:\\bot seo" "${botDir}" /MIR /XD venv node_modules __pycache__`, { stdio: 'inherit' });
} catch (err) {
  // robocopy returns exit codes > 0 even on success (e.g. 1 means files copied). 
  // Any code < 8 is typically success.
  if (err.status >= 8) {
    console.error('Robocopy failed:', err.status);
  } else {
    console.log('Bot SEO copied successfully.');
  }
}

// Create Root .gitignore
const rootGitignore = `
node_modules/
bot_seo/
E_drive/
.env
.env.local
`;
fs.writeFileSync(path.join(root, '.gitignore'), rootGitignore.trim());
console.log('Created root .gitignore');

console.log('DONE!');
