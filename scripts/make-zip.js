const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const pluginPhpPath = path.join(__dirname, '../fb-analytic.php');
const pluginPhp = fs.readFileSync(pluginPhpPath, 'utf-8');

const nameMatch = pluginPhp.match(/Plugin Name:\s*(.+)/);
const pluginName = nameMatch ? nameMatch[1].trim().replace(/\s+/g, '-') : 'plugin';

const versionMatch = pluginPhp.match(/Version:\s*(.+)/);
const pluginVersion = versionMatch ? versionMatch[1].trim() : '1.0.0';

const zipFileName = `${pluginName}-${pluginVersion}.zip`;

const tmpDir = path.join(__dirname, '../.zip-temp');
fs.removeSync(tmpDir);
fs.mkdirSync(tmpDir);

const distIgnorePath = path.join(__dirname, '../.distignore');
let ignorePatterns = [];

if (fs.existsSync(distIgnorePath)) {
    ignorePatterns = fs.readFileSync(distIgnorePath, 'utf-8')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'));
}

const filesToInclude = [
    'fb-analytic.php',
    'build',
    'css',
    'templates',
    'acf-json',
    'vendor',
    'src/PHP',
];

filesToInclude.forEach((file) => {
    const src = path.join(__dirname, '../', file);

    if (!fs.existsSync(src)) {
        console.warn(`File/folder not found: ${file}`);
        return;
    }

    if (ignorePatterns.includes(file)) {
        console.log(`Skipping ${file} because of .distignore`);
        return;
    }

    fs.copySync(src, path.join(tmpDir, file));
});

execSync(`cd ${tmpDir} && zip -r ../${zipFileName} .`, { stdio: 'inherit' });

fs.removeSync(tmpDir);

console.log(`Done. ZIP file created: ${zipFileName}`);
