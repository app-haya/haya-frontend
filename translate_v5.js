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
// Allow spaces and newlines around the text
const textNodesRegex = />([\s\n\r\t]*?)([^<>{}\n\r\t]+?)([\s\n\r\t]*?)</g;
const placeholderRegex = /placeholder="([^"\{\}]+?)"/gi;
const ternaryRegex = /{{\s*([^?]+?)\s*\?\s*["']([^"']+)["']\s* : \s*["']([^"']+)["']\s*}}/gi; // Simplified ternary

walkDir('d:/haya/src/app/components', function (filePath) {
    if (filePath.endsWith('.html')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modifiedData = content;

        modifiedData = modifiedData.replace(textNodesRegex, (match, before, text, after) => {
            let val = text.trim();
            if (!val || val.length <= 1 || !isNaN(val) || val.includes('translate') || val.includes('{{')) return match;
            stringsToTranslate.add(val);
            return `>${before}{{ '${val}' | translate }}${after}<`;
        });

        modifiedData = modifiedData.replace(placeholderRegex, (match, text) => {
            let val = text.trim();
            if (!val || val.length <= 1 || !isNaN(val) || val.includes('translate') || val.includes('{{')) return match;
            stringsToTranslate.add(val);
            return `[placeholder]="'${val}' | translate"`;
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
    "Add Admin": "إضافة مدير",
    "Remove": "إزالة",
    "Feature": "الميزة",
    "Select User": "اختر المستخدم",
    "Select Country": "اختر الدولة",
    "Select City": "اختر المدينة",
    "Business": "تجاري",
    "Personal": "شخصي",
    "Add Deal": "إضافة عرض",
    "Adding Deal...": "جاري إضافة عرض...",
    "Select Role": "اختر الصلاحية",
    "Actions": "الإجراءات",
    "Edit": "تعديل",
    "Delete": "حذف",
    "Save": "حفظ",
    "Cancel": "إلغاء",
    "Search...": "بحث...",
    "Close": "إغلاق",
    "Submit": "إرسال",
    "Update": "تحديث",
    "Loading...": "جاري التحميل..."
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
