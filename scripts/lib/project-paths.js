const fs = require('fs');
const os = require('os');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..', '..');

function loadProjectConfig() {
    const configPath = path.join(PROJECT_ROOT, 'project.config.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function expandHome(inputPath) {
    if (!inputPath || typeof inputPath !== 'string') return inputPath;
    if (inputPath.startsWith('~/')) {
        const home = process.env.HOME || process.env.USERPROFILE || os.homedir();
        return path.join(home, inputPath.slice(2));
    }
    return inputPath;
}

function resolveProjectPath(relativeOrAbsolute) {
    const expanded = expandHome(relativeOrAbsolute);
    return path.isAbsolute(expanded) ? expanded : path.join(PROJECT_ROOT, expanded);
}

const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'assets', 'images');

module.exports = {
    PROJECT_ROOT,
    PUBLIC_DIR,
    IMAGES_DIR,
    loadProjectConfig,
    expandHome,
    resolveProjectPath,
};
