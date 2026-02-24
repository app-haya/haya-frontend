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

// 1. Tags with inner text
const tagsRegex = /<(button|h[1-6]|label|p|small|strong|b|span|a|th|td|div|option)\b([^>]*)>([\s]*?)([^<>\n\{]+?)([\s]*?)<\/\1>/gi;

// 2. Placeholder attributes
const placeholderRegex = /placeholder="([^"\{\}]+?)"/gi;

// 3. Ternary string bindings {{ condition ? 'A' : 'B' }}
const ternaryRegex = /{{\s*([^?]+?)\s*\?\s*["']([^"']+)["']\s*:\s*["']([^"']+)["']\s*}}/gi;

walkDir('d:/haya/src/app/components', function (filePath) {
    if (filePath.endsWith('.html')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modifiedData = content;

        // Handle Tags
        modifiedData = modifiedData.replace(tagsRegex, (match, tag, attr, spaceBefore, inner, spaceAfter) => {
            let text = inner.trim();
            if (!text || text.length <= 1 || !isNaN(text) || text.includes('translate') || text.includes('{{')) return match;
            stringsToTranslate.add(text);
            return `<${tag}${attr}>${spaceBefore}{{ '${text}' | translate }}${spaceAfter}</${tag}>`;
        });

        // Handle Placeholders
        modifiedData = modifiedData.replace(placeholderRegex, (match, text) => {
            let val = text.trim();
            if (!val || val.length <= 1 || !isNaN(val)) return match;
            stringsToTranslate.add(val);
            return `[placeholder]="'${val}' | translate"`;
        });

        // Handle Ternaries
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
    "Select User": "اختر المستخدم",
    "Select Country": "اختر الدولة",
    "Select City": "اختر المدينة",
    "Remove": "إزالة",
    "Feature": "الميزة",
    "Adding Deal...": "جاري إضافة العرض...",
    "Add Deal": "إضافة عرض",
    "Business": "تجاري",
    "Personal": "شخصي",
    "Select": "اختر",
    "Search": "بحث",
    "Adding Admin...": "جاري إضافة مدير...",
    "Add Admin": "إضافة مدير",
    "Updating...": "جاري التحديث...",
    "Update": "تحديث",
    "Delete": "حذف",
    "Save": "حفظ",
    "Cancel": "إلغاء",
    "Search...": "بحث..."
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
