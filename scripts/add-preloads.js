const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '..');
const files = {
    'index.html': 'home1-2000w.webp',
    'about.html': 'backdrop-1200w.webp',
    'services.html': 'wed-2000w.webp',
    'portfolio.html': 'wed2-1200w.webp', // Portfolio doesn't have a hero really, skip or preload first image. Let's just preload the logo if there's no hero.
    'contact.html': ''
};

// Actually, let's preload the specific hero images used in backgrounds.
for (const [file, heroImg] of Object.entries(files)) {
    if (!heroImg) continue;
    
    const filePath = path.join(basePath, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Add preload to head
    if (heroImg) {
        const baseName = heroImg.replace(/-(2000|1200)w\.webp$/, '');
        const preloadTag = `    <link rel="preload" as="image" imagesrcset="assets/images/optimized/${baseName}-400w.avif 400w, assets/images/optimized/${baseName}-800w.avif 800w, assets/images/optimized/${baseName}-1200w.avif 1200w, assets/images/optimized/${baseName}-2000w.avif 2000w" imagesizes="100vw" type="image/avif">\n</head>`;
        
        // Remove old preload tag
        content = content.replace(/<link rel="preload"[^>]+>/g, '');
        content = content.replace('</head>', preloadTag);
    }
    
    // Add slider deferral script specifically to index.html
    if (file === 'index.html' && !content.includes('setTimeout(() => {')) {
        const scriptToAdd = `
        document.addEventListener('DOMContentLoaded', () => {
            // Defer non-critical slide background images
            setTimeout(() => {
                document.querySelectorAll('.slide[data-bg-style]').forEach(el => {
                    const bgStyle = el.getAttribute('data-bg-style');
                    el.setAttribute('style', (el.getAttribute('style') || '') + bgStyle);
                    el.removeAttribute('data-bg-style');
                });
            }, 50);
        `;
        content = content.replace("document.addEventListener('DOMContentLoaded', () => {", scriptToAdd);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Added preload/defer to ${file}`);
}
