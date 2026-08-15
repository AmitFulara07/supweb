const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '../assets/images');
const optDir = path.join(__dirname, '../assets/images/optimized');

let origSize = 0;
fs.readdirSync(imgDir).forEach(f => {
    const s = fs.statSync(path.join(imgDir, f));
    if (s.isFile() && (f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'))) {
        origSize += s.size;
    }
});

let optSize = 0;
fs.readdirSync(optDir).forEach(f => {
    const s = fs.statSync(path.join(optDir, f));
    if (s.isFile()) {
        optSize += s.size;
    }
});

console.log(`Original: ${(origSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`Optimized Total (ALL sizes): ${(optSize / 1024 / 1024).toFixed(2)} MB`);
