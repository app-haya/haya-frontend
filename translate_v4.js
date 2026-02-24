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

// 1. Text between tags: >TEXT<
const textNodesRegex = />([^<>{}\n\r\t]+?)</g;

// 2. Placeholder attributes
const placeholderRegex = /placeholder="([^"\{\}]+?)"/gi;

// 3. Ternary string bindings {{ condition ? 'A' : 'B' }}
const ternaryRegex = /{{\s*([^?]+?)\s*\?\s*["']([^"']+)["']\s*:\s*["']([^"']+)["']\s*}}/gi;

walkDir('d:/haya/src/app/components', function (filePath) {
    if (filePath.endsWith('.html')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modifiedData = content;

        // Handle Text Nodes
        modifiedData = modifiedData.replace(textNodesRegex, (match, text) => {
            let val = text.trim();
            if (!val || val.length <= 1 || !isNaN(val) || val.includes('translate')) return match;
            // Avoid replacing inside script or style tags (simplified)
            // Also avoid replacing CSS class names if the regex matches incorrectly (unlikely with > <)
            stringsToTranslate.add(val);
            return `>{{ '${val}' | translate }}<`;
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
