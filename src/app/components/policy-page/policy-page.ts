import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SettingsService } from '../../services/settings.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-policy-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './policy-page.html',
  styleUrl: './policy-page.css'
})
export class PolicyPage implements OnInit {
  type: 'terms' | 'privacy' | 'about' | 'merchant' = 'terms';
  title = '';
  subtitle = '';
  content = '';
  lastUpdated = '';
  isMobileMenuOpen = false;
  currentYear = new Date().getFullYear();
  sections: any[] = [];
  activeSectionId = 'intro';

  constructor(private route: ActivatedRoute, private settingsService: SettingsService) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.type = data['type'];
      this.loadContent();
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.sections.length <= 1) return;
    
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const offset = 150; // offset for sticky header / navbar

    for (const sec of this.sections) {
      const el = document.getElementById(sec.id);
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        
        if (scrollPosition + offset >= top && scrollPosition + offset < top + height) {
          this.activeSectionId = sec.id;
          break;
        }
      }
    }
  }

  scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      const offset = 120; // offset for sticky header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      this.activeSectionId = id;
    }
  }

  parseSections(rawText: string): any[] {
    if (!rawText) return [];
    
    // Split text into lines, trim each line, and filter out empty ones
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    const matchedHeadings = this.type === 'privacy' ? [
      'البيانات التي نجمعها',
      'كيف نستخدم بياناتك؟',
      'مشاركة البيانات وحمايتها',
      'حقوق المستخدم والتحكم بالبيانات',
      'أسئلة'
    ] : this.type === 'terms' ? [
      'شروط الحساب والأمان',
      'سياسة الاستخدام العادل والمحتوى الاجتماعي',
      'المعاملات التجارية والحجوزات',
      'سياسة توب 30',
      'أسئلة'
    ] : this.type === 'merchant' ? [
      'المميزات',
      'إنشاء حساب تاجر',
      'دليل ربط API',
      'لوحة تحكم التاجر',
      'سياسة توب 30',
      'الدعم الفني'
    ] : [];

    if (matchedHeadings.length === 0) {
      return [{
        id: 'intro',
        title: 'مقدمة',
        lines: lines,
        isIntro: true,
        index: 0
      }];
    }

    const sections: any[] = [];
    
    // The first section is always the introduction ("مقدمة")
    let currentSection = {
      id: 'intro',
      title: 'مقدمة',
      lines: [] as string[],
      isIntro: true,
      index: 0
    };
    
    sections.push(currentSection);
    let sectionIndex = 1;

    for (const line of lines) {
      // Find if this line is a heading (exact match after trimming OR starts with #)
      const startsWithHash = line.startsWith('#');
      const isHeading = matchedHeadings.some(h => line === h) || startsWithHash;
      
      if (isHeading) {
        // Strip the '#' symbol and any leading spaces
        const headingTitle = startsWithHash ? line.replace(/^#+\s*/, '') : line;
        
        currentSection = {
          id: `section-${sectionIndex}`,
          title: headingTitle,
          lines: [] as string[],
          isIntro: false,
          index: sectionIndex
        };
        sections.push(currentSection);
        sectionIndex++;
      } else {
        // Filter out footer suggestion if it came in the raw API data
        if (line.includes('تبحث عن معلومات أخرى') || line.includes('اطّلع على سياسة الخصوصية')) {
          continue;
        }
        currentSection.lines.push(line);
      }
    }

    // Clean up empty sections if any
    return sections.filter(sec => sec.isIntro || sec.lines.length > 0);
  }

  loadContent() {
    this.lastUpdated = '';
    this.sections = [];
    this.activeSectionId = 'intro';
    
    if (this.type === 'terms') {
      this.title = 'الشروط والأحكام';
      this.subtitle = 'نحن هنا لضمان تجربة آمنة وراقية لجميع مستخدمي هيا. يرجى قراءة هذه الاتفاقية لفهم التزاماتكم وحقوقكم.';
      this.settingsService.getPublicTerms('ar').subscribe({
        next: (res) => {
          if (res && res.data) {
            this.content = res.data;
            this.lastUpdated = res.last_updated || '';
            this.sections = this.parseSections(this.content);
          }
        },
        error: (err) => {
          console.error('Error loading terms:', err);
          this.content = 'عذراً، فشل تحميل الشروط والأحكام حالياً. يرجى المحاولة لاحقاً.';
          this.sections = this.parseSections(this.content);
        }
      });
    } else if (this.type === 'privacy') {
      this.title = 'سياسة الخصوصية';
      this.subtitle = 'نحن في هيّا نلتزم بحماية خصوصيتك وضمان أمان بياناتك الشخصية كجزء لا يتجزأ من هويتنا السعودية العريقة.';
      this.settingsService.getPublicPrivacy('ar').subscribe({
        next: (res) => {
          if (res && res.data) {
            this.content = res.data;
            this.lastUpdated = res.last_updated || '';
            this.sections = this.parseSections(this.content);
          }
        },
        error: (err) => {
          console.error('Error loading privacy:', err);
          this.content = 'عذراً، فشل تحميل سياسة الخصوصية حالياً. يرجى المحاولة لاحقاً.';
          this.sections = this.parseSections(this.content);
        }
      });
    } else if (this.type === 'about') {
      this.title = 'من نحن';
      this.subtitle = 'تعرّف على منصة هيّا، مستقبل الخدمات الرقمية بروح تجديدية أصيلة.';
      this.settingsService.getPublicAboutUs('ar').subscribe({
        next: (res) => {
          if (res && res.data) {
            this.content = res.data;
            this.lastUpdated = res.last_updated || '';
            this.sections = this.parseSections(this.content);
          }
        },
        error: (err) => {
          console.error('Error loading about us:', err);
          this.content = 'عذراً، فشل تحميل معلومات من نحن حالياً. يرجى المحاولة لاحقاً.';
          this.sections = this.parseSections(this.content);
        }
      });
    } else if (this.type === 'merchant') {
      this.title = 'ربط متجرك مع هيّا';
      this.subtitle = 'وسّع نطاق مبيعاتك من خلال ربط متجرك مع تطبيق هيّا عبر واجهة برمجة التطبيقات (API)، وتمكين مزامنة المنتجات والطلبات بسهولة وأمان.';
      this.lastUpdated = 'آخر تحديث في 17 مايو 2026';
      this.content = `مرحباً بك في صفحة مطوري هيّا.
يوفر تطبيق هيّا واجهة برمجة تطبيقات (API) تتيح للمتاجر الإلكترونية ربط أنظمتها مباشرة مع التطبيق، مما يساهم في إدارة المنتجات والطلبات بشكل آلي وسلس.
سواء كنت تمتلك متجراً إلكترونياً أو نظاماً خاصاً، يمكنك دمجه مع هيّا والاستفادة من قاعدة مستخدمينا دون الحاجة إلى إدارة الطلبات يدوياً.

# المميزات
ربط مباشر عبر API.
مزامنة المنتجات تلقائياً.
استقبال الطلبات بشكل فوري.
تحديث حالة الطلبات.
توثيق آمن باستخدام API Key.
تكامل سريع مع الأنظمة المختلفة.

# إنشاء حساب تاجر
قبل البدء بعملية الربط، يجب إنشاء حساب تاجر داخل تطبيق هيّا.
خطوات إنشاء الحساب:
تحميل تطبيق هيّا.
إنشاء حساب باستخدام رقم الجوال.
الدخول إلى الملف الشخصي.
تعبئة بيانات النشاط التجاري.
انتظار الموافقة.
بعد الموافقة سيتم تفعيل حساب التاجر وإتاحة إنشاء مفاتيح API.
[button:حمل التطبيق]

# دليل ربط API
الربط عبر واجهة البرمجة (API) يتيح لك مزامنة المنتجات والطلبات بشكل مباشر.
يمكنك استخدام المسارات البرمجية التالية بعد الحصول على رمز التفويض (Token):
مسار تسجيل دخول الكاشير:
POST /api/v1/cashier/login
البرامتر: email (اختياري)، phone (اختياري إذا لم يدخل البريد)، password (كلمة مرور الكاشير)
مسار التحقق من العميل:
GET /api/v1/cashier/customers/lookup?phone=966xxxxxxxx
البرامتر: phone (رقم جوال العميل للتحقق من وجوده وجلب بياناته)
مسار تسجيل الفاتورة وإضافة النقاط:
POST /api/v1/cashier/invoices
البرامتر: phone (رقم جوال العميل)، invoice_number (رقم الفاتورة)، amount (قيمة الفاتورة بالريال)
توليد مفاتيح الربط يتم من خلال إعدادات حساب التاجر.

# لوحة تحكم التاجر
إذا لم يكن لديك متجر إلكتروني أو نظام يدعم التكامل عبر API، يمكنك التواصل معنا، وسيقوم فريق هيّا بإنشاء حساب تاجر وتفعيل لوحة التحكم المناسبة لنشاطك.
تواصل معنا عبر:
الحساب الرسمي هيّا HAYA-APP-800.

# سياسة توب 30
عدالة التنافس: يتم احتساب النقاط بناءً على الأنشطة الحقيقية والمشروعة للمستخدم داخل التطبيق (التفاعل، الاستخدام، المعاملات).
مكافحة الاحتيال: يُحظر حظراً تاماً استخدام أي برمجيات خارجية، ثغرات، حسابات وهمية، أو أساليب تلاعب لزيادة النقاط وتصدر قائمة التوب 30.
العقوبات والإجراءات: في حال رصد أي سلوك مشبوه أو محاولة غش، تمتلك إدارة هيّا الحق المطلق في تصفير نقاط الحساب فوراً، الحرمان النهائي من الجوائز الشهرية، أو حظر الحساب بشكل دائم دون أدنى مسؤولية قانونية أو مالية على التطبيق.
القرارات النهائية: تعتبر لوحة الصدارة لـ توب 30 المعلنة نهاية كل شهر ميلادي قطعية ولا يجوز الطعن فيها بعد مراجعتها تقنياً من فريق الدعم.

# الدعم الفني
إذا كان لديك أي استفسارات أو شكاوى أو اقتراحات، يمكنك التواصل معنا على الرقم الموحد HAYA-APP-800. سنبذل قصارى جهدنا لمعالجة شكواك في أسرع فرصة.`;
      this.sections = this.parseSections(this.content);
    }
  }
}
