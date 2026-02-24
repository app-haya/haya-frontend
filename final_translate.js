const fs = require('fs');

const arFile = 'd:/haya/src/assets/i18n/ar.json';
const arData = JSON.parse(fs.readFileSync(arFile, 'utf8'));

const finalDict = {
    "Yes": "نعم",
    "No": "لا",
    "Governmental": "جهة حكومية",
    "Merchant": "تاجر",
    "Doctor": "طبيب",
    "Patient": "مريض",
    "Saving...": "جاري الحفظ...",
    "No approved deals found.": "لم يتم العثور على عروض مقبولة.",
    "Search by title, account number...": "البحث بالعنوان، رقم الحساب...",
    "Enter a new word...": "أدخل كلمة جديدة...",
    "No events found": "لم يتم العثور على أحداث",
    "Event title": "عنوان الحدث",
    "Search by name or country...": "البحث بالاسم أو الدولة...",
    "No countries found.": "لم يتم العثور على دول.",
    "Prev": "السابق",
    "Next": "التالي",
    "Transaction & Documents": "المعاملات والمستندات",
    "New": "جديد",
    "Used": "مستعمل",
    "Submit": "إرسال",
    "Write the rejection reason...": "اكتب سبب الرفض...",
    "Search by name, email, or phone...": "البحث بالاسم، البريد أو الهاتف...",
    "Private": "خاص",
    "Public": "عام",
    "Verified": "موثق",
    "Search by name...": "البحث بالاسم...",
    "LOG IN": "تسجيل الدخول",
    "Search by message or sender...": "البحث بالرسالة أو المرسل...",
    "Open": "فتح",
    "Search by name, email...": "البحث بالاسم، البريد...",
    "Approve": "قبول",
    "Select a country first": "اختر الدولة أولاً",
    "Select Gender": "اختر الجنس",
    "Male": "ذكر",
    "Female": "أنثى",
    "Admin": "مدير",
    "Select type": "اختر النوع",
    "ADD": "إضافة",
    "Select gender": "اختر الجنس",
    "Enter name": "أدخل الاسم",
    "Enter email": "أدخل البريد الإلكتروني",
    "Enter phone": "أدخل رقم الهاتف",
    "Update User": "تحديث المستخدم",
    "Not Verified": "غير موثق",
    "Show Details": "عرض التفاصيل",
    "Add Role": "إضافة صلاحية",
    "Update Admin": "تحديث المدير",
    "Add Word": "إضافة كلمة",
    "Add City": "إضافة مدينة",
    "Add Country": "إضافة دولة",
    "Back to List": "العودة للقائمة",
    "Open Full Document": "فتح المستند بالكامل",
    "Open Full Invoice": "فتح الفاتورة بالكامل",
    "Approve Deal": "قبول العرض",
    "Add Interest": "إضافة اهتمام"
};

for (let key in finalDict) {
    arData[key] = finalDict[key];
}

// Clean up any remaining _AR
for (let key in arData) {
    if (arData[key].endsWith('_AR')) {
        arData[key] = arData[key].replace('_AR', '');
    }
}

fs.writeFileSync(arFile, JSON.stringify(arData, null, 4), 'utf8');
console.log('Final cleanup done.');
