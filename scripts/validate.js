#!/usr/bin/env node
/**
 * Valida estrutura do projeto antes de commit ou deploy (Vercel/Netlify).
 */
const fs = require('fs');
const path = require('path');
const {
    PROJECT_ROOT,
    PUBLIC_DIR,
    IMAGES_DIR,
    loadProjectConfig,
    resolveProjectPath,
} = require('./lib/project-paths');

const IMAGE_EXT = new Set(['.webp', '.jpg', '.jpeg', '.png', '.avif']);
const PLACEHOLDER_WHATSAPP = '5549999999999';

let errors = 0;
let warnings = 0;

function fail(message) {
    console.error(`  ✗ ${message}`);
    errors += 1;
}

function warn(message) {
    console.warn(`  ! ${message}`);
    warnings += 1;
}

function ok(message) {
    console.log(`  ✓ ${message}`);
}

function fileExists(relativePath) {
    return fs.existsSync(path.join(PROJECT_ROOT, relativePath));
}

function readManifest(config) {
    const manifestPath = resolveProjectPath(config.images.manifest);
    if (!fs.existsSync(manifestPath)) {
        fail(`Manifest não encontrado: ${config.images.manifest}`);
        return null;
    }
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

function checkStructure(config) {
    console.log('\nEstrutura do projeto');
    const required = [
        'public/index.html',
        'public/assets/css/main.css',
        'public/assets/js/main.js',
        'public/assets/js/config.js',
        'public/assets/js/config.example.js',
        'public/assets/js/images.js',
        'scripts/dev-server.js',
        'vercel.json',
        'netlify.toml',
        'project.config.json',
    ];

    for (const rel of required) {
        if (fileExists(rel)) ok(rel);
        else fail(`Arquivo obrigatório ausente: ${rel}`);
    }

    for (const section of config.images.sections) {
        const sectionDir = path.join(IMAGES_DIR, section);
        if (!fs.existsSync(sectionDir)) {
            fail(`Pasta de imagens ausente: public/assets/images/${section}`);
        }
    }
}

function checkManifestAssets(manifest) {
    if (!manifest?.assets?.length) return;

    console.log('\nImagens do manifest');
    const seen = new Set();

    for (const asset of manifest.assets) {
        const key = `${asset.section}/${asset.filename}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const filePath = path.join(IMAGES_DIR, asset.section, asset.filename);
        if (fs.existsSync(filePath)) ok(key);
        else fail(`Imagem esperada ausente: ${key}`);
    }
}

function checkConfig() {
    console.log('\nConfiguração do cliente');
    const configPath = path.join(PUBLIC_DIR, 'assets', 'js', 'config.js');
    const content = fs.readFileSync(configPath, 'utf8');

    if (content.includes(PLACEHOLDER_WHATSAPP)) {
        warn('WhatsApp ainda usa placeholder em public/assets/js/config.js — atualize antes do deploy.');
    } else {
        ok('WhatsApp configurado (não placeholder)');
    }
}

function checkNoDocsInPublic() {
    console.log('\nAssets publicáveis');
    const blocked = ['GUIA-IMAGENS-IA.md', 'PROMPTS-BASICOS.md', 'manifest.json'];
    for (const name of blocked) {
        const filePath = path.join(IMAGES_DIR, name);
        if (fs.existsSync(filePath)) {
            fail(`Documentação de dev não deve ficar em public/: ${name}`);
        }
    }
    if (!errors) ok('Sem documentação de dev em public/assets/images/');
}

function main() {
    console.log('Sartoria Landing — validação');
    console.log('============================');

    const config = loadProjectConfig();
    const manifest = readManifest(config);

    checkStructure(config);
    checkNoDocsInPublic();
    if (manifest) checkManifestAssets(manifest);
    checkConfig();

    console.log('');
    if (errors) {
        console.error(`Falhou: ${errors} erro(s), ${warnings} aviso(s).\n`);
        process.exit(1);
    }

    console.log(`OK: ${warnings ? `${warnings} aviso(s).` : 'pronto para deploy.'}\n`);
    process.exit(0);
}

main();
