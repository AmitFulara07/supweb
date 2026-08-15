const fs = require('fs');
const path = require('path');

const htmlFiles = [
    'index.html',
    'about.html',
    'services.html',
    'portfolio.html',
    'contact.html'
];

const basePath = path.join(__dirname, '..');

for (const file of htmlFiles) {
    const filePath = path.join(basePath, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Regex to match style="background-image: url('assets/images/X.jpg');"
    // Also handling missing quotes or different quotes
    const bgRegex = /style="background-image:\s*url\(['"]?(assets\/images\/[^'"]+)['"]?\);"/g;
    
    content = content.replace(bgRegex, (match, src) => {
        const filename = path.basename(src);
        const parsed = path.parse(filename);
        const name = parsed.name;

        // Skip non-optimizable files or data URIs
        if (src.includes('data:') || src.includes('.svg')) return match;

        // Use 1200w for normal backgrounds, 2000w for heroes.
        // We'll just use 1200w for .dynamic-service-bg and 2000w for .slide and .page-hero
        // Since we are just replacing the style attribute, we can use 2000w as it's full width.
        let width = '1200w';
        if (['home1', 'home2', 'table1', 'bride', 'wed', 'backdrop', 'portfolio18'].includes(name)) {
             width = '2000w';
        }

        const avifUrl = `assets/images/optimized/${name}-${width}.avif`;
        const webpUrl = `assets/images/optimized/${name}-${width}.webp`;

        // Create image-set string
        // image-set(url('...') 1x, url('...') 1x)
        const imageSet = `image-set(url('${avifUrl}') type('image/avif'), url('${webpUrl}') type('image/webp'))`;
        // Fallback for older browsers
        const fallback = `url('${webpUrl}')`;

        return `style="background-image: ${fallback}; background-image: -webkit-${imageSet}; background-image: ${imageSet};"`;
    });

    // Special logic for deferring slider images
    // <div class="slide" style="..."> -> <div class="slide" data-bg="...">
    if (file === 'index.html') {
        const slide2Regex = /<div class="slide"\s+style="([^"]+)"\s*>/g;
        content = content.replace(slide2Regex, (match, styles) => {
            return `<div class="slide" data-bg-style="${styles}">`;
        });
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated backgrounds in ${file}`);
}
