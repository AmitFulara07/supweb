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

    let oldContent;
    do {
        oldContent = content;
        // Find an outer <picture>...<picture> block
        content = content.replace(/<picture>(\s*<source[^>]+>){2}\s*<picture>/g, '<picture>');
        // Then we'll have an extra </picture> at the end
        content = content.replace(/<\/picture>\s*<\/picture>/g, '</picture>');
    } while (content !== oldContent);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned nested <picture> tags in ${file}`);
}
