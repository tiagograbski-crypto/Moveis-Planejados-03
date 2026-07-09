const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const sourcePath = path.join(__dirname, '..', 'public', 'social', 'logotipo-tendencia-source.png');
const outputPath = path.join(__dirname, '..', 'public', 'social', 'logotipo-tendencia.png');
const inputPath = fs.existsSync(sourcePath)
  ? sourcePath
  : outputPath;

const png = PNG.sync.read(fs.readFileSync(inputPath));

for (let y = 0; y < png.height; y += 1) {
  for (let x = 0; x < png.width; x += 1) {
    const idx = (png.width * y + x) << 2;
    const red = png.data[idx];
    const green = png.data[idx + 1];
    const blue = png.data[idx + 2];

    if (red < 48 && green < 48 && blue < 48) {
      png.data[idx + 3] = 0;
      continue;
    }

    png.data[idx + 3] = 255;
  }
}

if (!fs.existsSync(sourcePath)) {
  fs.copyFileSync(inputPath, sourcePath);
}

fs.writeFileSync(outputPath, PNG.sync.write(png));
console.log(`Logo processado: ${png.width}x${png.height} -> ${outputPath}`);
