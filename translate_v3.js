const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const stringsToTranslate = new Set();

// Improved regex to handle > inside attributes (e.g. *ngIf="a > b")
const tagsRegex = /<(button|h[1-6]|label|p|small|strong|b|span|a|th|td|div|option)\b([^"']|"[^"]*"|'[^']*')*?>([\s]*?)([^<>\n\{]+?)([\s]*?)<\/\1>/gi;
const placeholderRegex = /placeholder="([^"\{\}]+?)"/gi;
const ternaryRegex = /{{\s*([^?]+?)\s*\?\s*["']([^"']+)["']\s*:\s*["']([^"']+)["']\s*}}/gi;

walkDir('d:/haya/src/app/components', function (filePath) {
    if (filePath.endsWith('.html')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modifiedData = content;

        modifiedData = modifiedData.replace(tagsRegex, (match, tag, attr, dummy, spaceBefore, inner, spaceAfter) => {
            let text = inner.trim();
            if (!text || text.length <= 1 || !isNaN(text) || text.includes('translate') || text.includes('{{')) return match;
            stringsToTranslate.add(text);

            // Reconstruct the tag. We need to find where the opening tag actually ends.
            // The regex above is a bit complex for capturing 'attr' correctly because of the nested group.
            // Let's just find the first '>' that is not followed by </tag> immediately if we wanted to be perfect, 
            // but here the first capture group is the tag name.

            // Actually, let's just use the match and replace the inner part specifically.
            // match is something like <button ...>Remove</button>
            // We want to replace the part between the first > and the last </tag>

            let firstClose = match.indexOf('>');
            let lastOpen = match.lastIndexOf('</');
            let openTagPart = match.substring(0, firstClose + 1);
            let closeTagPart = match.substring(lastOpen);

            return `${openTagPart}${spaceBefore}{{ '${text}' | translate }}${spaceAfter}${closeTagPart}`;
        });

        modifiedData = modifiedData.replace(placeholderRegex, (match, text) => {
            let val = text.trim();
            if (!val || val.length <= 1 || !isNaN(val)) return match;
            stringsToTranslate.add(val);
            return `[placeholder]="'${val}' | translate"`;
        });

        modifiedData = modifiedData.replace(ternaryRegex, (match, cond, val1, val2) => {
            stringsToTranslate.add(val1.trim());
            stringsToTranslate.add(val2.trim());
            return `{{ ${cond} ? ('${val1.trim()}' | translate) : ('${val2.trim()}' | translate) }}`;
        });

        if (content !== modifiedData) {
            fs.writeFileSync(filePath, modifiedData, 'utf8');
            console.log('Updated HTML:', filePath);
        }
    }
});

const enFile = 'd:/haya/src/assets/i18n/en.json';
const arFile = 'd:/haya/src/assets/i18n/ar.json';
const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));
const arData = JSON.parse(fs.readFileSync(arFile, 'utf8'));

const dict = {
    "Remove": "إزالة",
    "Feature": "الميزة",
    "Select User": "اختر المستخدم",
    "Select Country": "اختر الدولة",
    "Select City": "اختر المدينة",
    "Business": "تجاري",
    "Personal": "شخصي",
    "Add Deal": "إضافة عرض",
    "Adding Deal...": "جاري إضافة عرض..."
};

for (let key of stringsToTranslate) {
    if (!enData[key]) enData[key] = key;
    if (!arData[key] || arData[key].endsWith('_AR')) {
        let arabicVal = dict[key];
        if (!arabicVal) {
            const lowerKey = key.toLowerCase();
            const found = Object.keys(dict).find(k => k.toLowerCase() === lowerKey);
            if (found) arabicVal = dict[found];
        }
        arData[key] = arabicVal ? arabicVal : key + "_AR";
    }
}

fs.writeFileSync(enFile, JSON.stringify(enData, null, 4), 'utf8');
fs.writeFileSync(arFile, JSON.stringify(arData, null, 4), 'utf8');
console.log('Done.');
