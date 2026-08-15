const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '..');

// Helper to generate picture tag
function generatePicture(name, isLazy = false) {
    const lazyAttr = isLazy ? 'loading="lazy"' : '';
    return `
        <picture class="hero-bg-picture" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -2;">
            <source srcset="assets/images/optimized/${name}-400w.avif 400w, assets/images/optimized/${name}-800w.avif 800w, assets/images/optimized/${name}-1200w.avif 1200w, assets/images/optimized/${name}-2000w.avif 2000w" sizes="100vw" type="image/avif">
            <source srcset="assets/images/optimized/${name}-400w.webp 400w, assets/images/optimized/${name}-800w.webp 800w, assets/images/optimized/${name}-1200w.webp 1200w, assets/images/optimized/${name}-2000w.webp 2000w" sizes="100vw" type="image/webp">
            <img src="assets/images/optimized/${name}-2000w.webp" alt="Background" class="hero-bg-img" style="width: 100%; height: 100%; object-fit: cover;" ${lazyAttr}>
        </picture>`;
}

// 1. Refactor index.html
function refactorIndex() {
    let content = fs.readFileSync(path.join(basePath, 'index.html'), 'utf8');
    
    // Add preconnects
    if (!content.includes('preconnect')) {
        content = content.replace(
            '<link\n        href="https://fonts.googleapis.com',
            '<link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link\n        href="https://fonts.googleapis.com'
        );
    }

    // Replace slides
    content = content.replace(/<div class="slide active"[^>]+>/, `<div class="slide active">\n${generatePicture('home1', false)}`);
    content = content.replace(/<div class="slide"\s+data-bg-style="[^"]+home2-2000w[^"]+"[^>]*>/, `<div class="slide">\n${generatePicture('home2', true)}`);
    content = content.replace(/<div class="slide"\s+data-bg-style="[^"]+table1-2000w[^"]+"[^>]*>/, `<div class="slide">\n${generatePicture('table1', true)}`);

    // Remove the slide deferring JS
    content = content.replace(/\/\/ Defer non-critical slide background images[\s\S]*?\}, 50\);/, '');

    fs.writeFileSync(path.join(basePath, 'index.html'), content, 'utf8');
    console.log('Refactored index.html');
}

// 2. Refactor other pages
function refactorPageHeader(filename, bgName, gradientOpacity) {
    const filePath = path.join(basePath, filename);
    let content = fs.readFileSync(filePath, 'utf8');

    // Add preconnects
    if (!content.includes('preconnect')) {
        content = content.replace(
            '<link\n        href="https://fonts.googleapis.com',
            '<link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link\n        href="https://fonts.googleapis.com'
        );
    }

    // Replace the style block background
    const bgRegex = new RegExp(`background:\\s*linear-gradient\\(.*?\\),\\s*url\\(['"]?assets/images/[^'"]+['"]?\\);`);
    content = content.replace(bgRegex, '');
    
    // Add position: relative and z-index: 1 to .page-header
    content = content.replace(/\.page-header\s*{[\s\S]*?}/, (match) => {
        if (!match.includes('position: relative;')) {
            return match.replace('}', '    position: relative;\n            z-index: 1;\n        }');
        }
        return match;
    });

    // Add ::before for gradient if not exists
    if (!content.includes('.page-header::before')) {
        const beforeStyle = `
        .page-header::before {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, ${gradientOpacity});
            z-index: -1;
        }`;
        content = content.replace('</style>', `${beforeStyle}\n    </style>`);
    }

    // Inject the picture tag
    const pictureHtml = generatePicture(bgName, false);
    // Find <div class="page-header ..."> or <div class="page-header">
    content = content.replace(/<div class="page-header[^"]*">/, (match) => {
        if (!content.includes('hero-bg-picture')) {
            return `${match}\n${pictureHtml}`;
        }
        return match;
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored ${filename}`);
}

function refactorServices() {
    const filePath = path.join(basePath, 'services.html');
    let content = fs.readFileSync(filePath, 'utf8');

    // Add preconnects
    if (!content.includes('preconnect')) {
        content = content.replace(
            '<link\n        href="https://fonts.googleapis.com',
            '<link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link\n        href="https://fonts.googleapis.com'
        );
    }

    // Replace page-hero
    content = content.replace(/<section class="page-hero">/, `<section class="page-hero" style="position: relative; z-index: 1;">\n${generatePicture('bride', false)}`);
    
    // Replace custom background section at line 303
    const customRegex = /style="background:\s*linear-gradient\(.*?\),\s*url\(['"]?assets\/images\/custom\.jpg['"]?\);\s*background-size:\s*cover;\s*background-position:\s*center;\s*padding:\s*100px 0;"/;
    content = content.replace(customRegex, 'style="position: relative; z-index: 1; padding: 100px 0;"');
    content = content.replace(/<section\s+style="position: relative; z-index: 1; padding: 100px 0;">/, `<section style="position: relative; z-index: 1; padding: 100px 0;">\n${generatePicture('custom', true)}\n        <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.75); z-index: -1;"></div>`);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored services.html`);

    // Remove background from styles.css
    const cssPath = path.join(basePath, 'assets/css/styles.css');
    let cssContent = fs.readFileSync(cssPath, 'utf8');
    cssContent = cssContent.replace(/background-image:\s*linear-gradient[^;]+;\s*/, '');
    fs.writeFileSync(cssPath, cssContent, 'utf8');
}

refactorIndex();
refactorPageHeader('about.html', 'groom', '0.7');
refactorPageHeader('contact.html', 'portfolio3', '0.75');
refactorPageHeader('portfolio.html', 'cover5', '0.7');
refactorServices();
