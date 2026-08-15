const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../assets/images');
const outputDir = path.join(__dirname, '../assets/images/optimized');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const widths = [400, 800, 1200, 2000];

async function processImage(file) {
    const filePath = path.join(inputDir, file);
    const parsed = path.parse(file);
    const name = parsed.name;
    const ext = parsed.ext.toLowerCase();

    if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;

    try {
        const metadata = await sharp(filePath).metadata();
        const originalWidth = metadata.width;

        for (const w of widths) {
            // Do not upsize
            const targetWidth = Math.min(w, originalWidth);
            const avifPath = path.join(outputDir, `${name}-${w}w.avif`);
            const webpPath = path.join(outputDir, `${name}-${w}w.webp`);

            // Only generate if it doesn't already exist or if we want to overwrite
            if (!fs.existsSync(avifPath)) {
                await sharp(filePath)
                    .resize({ width: targetWidth, withoutEnlargement: true })
                    .avif({ quality: 75 })
                    .toFile(avifPath);
            }

            if (!fs.existsSync(webpPath)) {
                await sharp(filePath)
                    .resize({ width: targetWidth, withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toFile(webpPath);
            }
        }
        console.log(`Optimized: ${file}`);
    } catch (err) {
        console.error(`Error processing ${file}:`, err);
    }
}

async function main() {
    console.log('Starting optimization...');
    const files = fs.readdirSync(inputDir);
    const promises = [];
    for (const file of files) {
        const stat = fs.statSync(path.join(inputDir, file));
        if (stat.isFile()) {
            promises.push(processImage(file));
        }
    }
    await Promise.all(promises);
    console.log('Optimization complete!');
}

main();
