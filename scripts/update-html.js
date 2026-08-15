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

// Helper to generate picture tag
function generatePictureTag(src, alt, classes, style, isAboveFold = false) {
    if (src.includes('header-logo')) {
        return `<img src="${src}" alt="${alt}" ${classes ? `class="${classes}"` : ''} ${style ? `style="${style}"` : ''}>`;
    }

    const filename = path.basename(src);
    const parsed = path.parse(filename);
    const name = parsed.name;
    
    // For hero/above-the-fold, we might want different sizes or loading attr
    const loadingAttr = isAboveFold ? '' : 'loading="lazy" decoding="async"';

    return `<picture>
    <source type="image/avif" srcset="assets/images/optimized/${name}-400w.avif 400w, assets/images/optimized/${name}-800w.avif 800w, assets/images/optimized/${name}-1200w.avif 1200w" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw">
    <source type="image/webp" srcset="assets/images/optimized/${name}-400w.webp 400w, assets/images/optimized/${name}-800w.webp 800w, assets/images/optimized/${name}-1200w.webp 1200w" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw">
    <img src="${src}" alt="${alt}" ${classes ? `class="${classes}"` : ''} ${style ? `style="${style}"` : ''} ${loadingAttr}>
</picture>`;
}

for (const file of htmlFiles) {
    const filePath = path.join(basePath, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Regex to match <img ... > optionally wrapped in our generated <picture> tag
    const imgRegex = /(?:<picture>[\s\S]*?)?<img\s+([^>]+)>(?:\s*<\/picture>)?/g;
    
    content = content.replace(imgRegex, (match, attrs) => {
        const srcMatch = attrs.match(/src="([^"]+)"/);
        const altMatch = attrs.match(/alt="([^"]*)"/);
        const classMatch = attrs.match(/class="([^"]+)"/);
        const styleMatch = attrs.match(/style="([^"]+)"/);
        
        const src = srcMatch ? srcMatch[1] : '';
        const alt = altMatch ? altMatch[1] : '';
        const classes = classMatch ? classMatch[1] : '';
        const style = styleMatch ? styleMatch[1] : '';

        // If it doesn't have src or is a logo, keep it unchanged
        if (!src || src.includes('header-logo.png') || src.includes('data:image')) {
            return match;
        }

        // Determine if above fold (heuristic: if it's the very first main image)
        // We'll manually handle heroes, but let's assume all <img src="assets/images/..."> are below fold in these pages EXCEPT maybe the founder portrait in about.html? 
        // Actually, the prompt says "Keep above-the-fold/near-viewport content prioritized".
        let isAboveFold = false;
        if (file === 'about.html' && src.includes('backdrop.jpeg')) isAboveFold = true; // wait, backdrop is the hero? Let's check.
        
        return generatePictureTag(src, alt, classes, style, isAboveFold);
    });

    // Also update CSS background images in inline styles
    const bgRegex = /style="background-image:\s*url\('([^']+)'\);"/g;
    content = content.replace(bgRegex, (match, url) => {
        // We will manually fix these using multi_replace_file_content for heroes to ensure precise logic.
        return match;
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated images in ${file}`);
}
