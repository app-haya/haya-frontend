import { Component, OnInit, HostListener, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SettingsService } from '../../services/settings.service';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface PolicySection {
  id: string;
  title: string;
  htmlContent: SafeHtml;
  isIntro: boolean;
  index: number;
}

@Component({
  selector: 'app-policy-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './policy-page.html',
  styleUrl: './policy-page.css',
  encapsulation: ViewEncapsulation.None
})
export class PolicyPage implements OnInit {
  type: 'terms' | 'privacy' | 'about' | 'merchant' = 'terms';
  title = '';
  subtitle = '';
  content = '';
  safeContent: SafeHtml = '';
  lastUpdated = '';
  isMobileMenuOpen = false;
  currentYear = new Date().getFullYear();
  sections: PolicySection[] = [];
  activeSectionId = 'intro';

  constructor(
    private route: ActivatedRoute,
    private settingsService: SettingsService,
    private sanitizer: DomSanitizer
  ) {}

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

  formatBodyContent(bodyHtml: string): string {
    if (!bodyHtml) return '';

    // 1. Replace [button:Label] globally anywhere in bodyHtml
    let html = bodyHtml.replace(/(?:<p[^>]*>|<li[^>]*>|<ul[^>]*>|<div[^>]*>|<br\s*\/?>|\r?\n|^)\s*\[button:(.*?)\]\s*(?:<\/p>|<\/li>|<\/ul>|<\/div>|\r?\n|$)/gi, (match, btnText) => {
      const cleanBtn = btnText.replace(/<[^>]*>/g, '').trim();
      return `\n<div class="lp-policy-section__btn-container" style="margin: 1.5rem 0; text-align: center; width: 100%;"><a href="/#download" class="lp-policy-section__btn" style="display: inline-block; background-color: #EFE8F4; color: #9259A6; padding: 0.75rem 2.25rem; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 0.95rem; cursor: pointer; border: none;">${cleanBtn}</a></div>\n`;
    });

    html = html.replace(/\[button:(.*?)\]/gi, (match, btnText) => {
      const cleanBtn = btnText.replace(/<[^>]*>/g, '').trim();
      return `\n<div class="lp-policy-section__btn-container" style="margin: 1.5rem 0; text-align: center; width: 100%;"><a href="/#download" class="lp-policy-section__btn" style="display: inline-block; background-color: #EFE8F4; color: #9259A6; padding: 0.75rem 2.25rem; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 0.95rem; cursor: pointer; border: none;">${cleanBtn}</a></div>\n`;
    });

    // 2. Replace GET/api/... or POST/api/... globally anywhere in bodyHtml
    html = html.replace(/(?:<p[^>]*>|<li[^>]*>|<br\s*\/?>|\r?\n|^)[•\-\*\s]*(GET|POST)\s*(\/api\/[^\s<]+)(?:<\/p>|<\/li>|\r?\n|$)/gi, (match, method, path) => {
      const m = method.toUpperCase();
      const p = path.replace(/<[^>]*>/g, '').trim();
      const methodClass = m === 'POST' ? 'lp-policy-section__api-method--post' : '';
      const badgeBg = m === 'POST' ? '#248fb4' : '#24b47e';
      return `\n<div class="lp-policy-section__api-route" style="display: flex; align-items: center; gap: 0.75rem; background-color: #f5f6fa; padding: 0.6rem 1rem; border-radius: 8px; font-family: Consolas, Monaco, monospace; font-size: 0.95rem; margin: 0.85rem 0; direction: ltr; text-align: left; border: 1px solid #eef0f6; width: 100%; box-sizing: border-box;"><span class="lp-policy-section__api-method ${methodClass}" style="background-color: ${badgeBg}; color: #ffffff; padding: 0.25rem 0.6rem; border-radius: 4px; font-weight: 700; font-size: 0.8rem; letter-spacing: 0.5px; display: inline-block; line-height: 1;">${m}</span><code class="lp-policy-section__api-path" style="color: #2c3e50; font-weight: 600; background: transparent; padding: 0; font-family: inherit;">${p}</code></div>\n`;
    });

    html = html.replace(/(?:^|\s|\n)(GET|POST)\s*(\/api\/[^\s<]+)/gi, (match, method, path) => {
      const m = method.toUpperCase();
      const p = path.replace(/<[^>]*>/g, '').trim();
      const methodClass = m === 'POST' ? 'lp-policy-section__api-method--post' : '';
      const badgeBg = m === 'POST' ? '#248fb4' : '#24b47e';
      return `\n<div class="lp-policy-section__api-route" style="display: flex; align-items: center; gap: 0.75rem; background-color: #f5f6fa; padding: 0.6rem 1rem; border-radius: 8px; font-family: Consolas, Monaco, monospace; font-size: 0.95rem; margin: 0.85rem 0; direction: ltr; text-align: left; border: 1px solid #eef0f6; width: 100%; box-sizing: border-box;"><span class="lp-policy-section__api-method ${methodClass}" style="background-color: ${badgeBg}; color: #ffffff; padding: 0.25rem 0.6rem; border-radius: 4px; font-weight: 700; font-size: 0.8rem; letter-spacing: 0.5px; display: inline-block; line-height: 1;">${m}</span><code class="lp-policy-section__api-path" style="color: #2c3e50; font-weight: 600; background: transparent; padding: 0; font-family: inherit;">${p}</code></div>\n`;
    });

    // 3. Format remaining text lines as bullet items if not already styled divs/lists
    const lines = html.replace(/<\/?p[^>]*>/gi, '\n').split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const finalResult: string[] = [];

    for (let line of lines) {
      if (/<(div|ul|ol|h[1-6]|table|iframe)[^>]*>/i.test(line)) {
        finalResult.push(line);
      } else {
        const cleanText = line.replace(/^[•\-\*]\s*/, '').replace(/<[^>]*>/g, '').trim();
        if (cleanText) {
          finalResult.push(`<ul class="lp-policy-section__list"><li><span class="lp-policy-section__bullet">•</span><span class="lp-policy-section__item-text">${cleanText}</span></li></ul>`);
        }
      }
    }

    return finalResult.length > 0 ? finalResult.join('') : html;
  }

  parseSections(rawText: string): PolicySection[] {
    if (!rawText) return [];
    
    // Clean out footer link if present in rawText
    let text = rawText
      .replace(/<p>\s*تبحث عن معلومات أخرى؟.*?<\/p>/gi, '')
      .replace(/تبحث عن معلومات أخرى؟.*/gi, '');

    // Normalize existing HTML headings h1, h3, h4, h5, h6 to h2
    text = text.replace(/<h[13456][^>]*>(.*?)<\/h[13456]>/gi, '<h2>$1</h2>');

    // Comprehensive list of known Arabic policy section heading phrases
    const knownHeadings = [
      'البيانات التي نجمعها',
      'كيف نستخدم بياناتك؟',
      'كيف نستخدم بياناتك',
      'مشاركة البيانات وحمايتها',
      'مشاركة البيانات',
      'حقوق المستخدم والتحكم بالبيانات',
      'حقوق المستخدم',
      'حماية البيانات والأمان',
      'حماية البيانات',
      'ملفات تعريف الارتباط',
      'التعديلات على سياسة الخصوصية',
      'قبول الشروط والأحكام',
      'قبول الشروط',
      'شروط الحساب والأمان',
      'شروط الحساب',
      'إنشاء حساب وتمكين التحقق من الهوية',
      'إنشاء حساب',
      'أهلية الاستخدام',
      'السلوك والمحتوى المحظور',
      'السلوك والمحتوى',
      'سياسة الاستخدام العادل والمحتوى الاجتماعي',
      'المعاملات التجارية والحجوزات',
      'المعاملات التجارية',
      'المحتوى الذي تنشره',
      'الحسابات',
      'العقوبات والإجراءات',
      'العقوبات',
      'سياسة توب 30',
      'توب 30',
      'عدالة التنافس',
      'مكافحة الاحتيال',
      'القرارات النهائية',
      'المميزات',
      'إنشاء حساب تاجر',
      'دليل ربط API',
      'لوحة تحكم التاجر',
      'الدعم الفني',
      'أسئلة'
    ];

    // 1. Replace # Known Heading with <h2>Known Heading</h2>
    for (const h of knownHeadings) {
      const escaped = h.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(?:---|--|:|\\.|\\s|<p>|<br\\s*\\/?>|^)*#\\s*(${escaped})(?::|\\s+|\\?|\\؟|<|\\n|$)`, 'gi');
      text = text.replace(regex, `\n<h2>$1</h2>\n`);
    }

    // 2. Match any remaining short title (1 to 5 words) after #
    text = text.replace(/(?:---|--|:\s*)*#\s*([\u0600-\u06FF\w\s]{2,35})(?=\s+[\u0600-\u06FF\w]{3,}|\n|$)/gi, (match, title) => {
      const words = title.trim().split(/\s+/);
      if (words.length <= 5) {
        return `\n<h2>${title.trim()}</h2>\n`;
      }
      return match;
    });

    // Clean up empty tags around <h2>
    text = text.replace(/<p>\s*<h2>/gi, '<h2>').replace(/<\/h2>\s*<\/p>/gi, '</h2>');
    text = text.replace(/<p>\s*<\/p>/gi, '');

    // If text has no <h2>, check for numbered headers like 1. Title
    if (!text.includes('<h2>')) {
      text = text.replace(/(?:<p>|\r?\n|^)\s*(\d+[\.\-]\s*[^<\n]{2,40})(?:<\/p>|\r?\n|$)/gi, (match, title) => {
        return `<h2>${title.trim()}</h2>`;
      });
      text = text.replace(/<p>\s*<\/p>/gi, '');
    }

    // If still no <h2>, treat entire content as single section
    if (!text.includes('<h2>')) {
      const formattedIntro = this.formatBodyContent(text);
      return [{
        id: 'intro',
        title: 'مقدمة',
        htmlContent: this.sanitizer.bypassSecurityTrustHtml(formattedIntro),
        isIntro: true,
        index: 0
      }];
    }

    // Split text by <h2>
    const parts = text.split(/<h2[^>]*>/i);
    const sections: PolicySection[] = [];

    // Content before first <h2> is Intro
    const rawIntro = parts[0].replace(/<p>\s*<\/p>/gi, '').replace(/<[^>]*>/g, '').trim();
    if (rawIntro) {
      const introHtml = this.formatBodyContent(parts[0]);
      sections.push({
        id: 'intro',
        title: 'مقدمة',
        htmlContent: this.sanitizer.bypassSecurityTrustHtml(introHtml),
        isIntro: true,
        index: 0
      });
    }

    let secIndex = 1;
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const closingIndex = part.indexOf('</h2>');
      if (closingIndex === -1) continue;

      let titleText = part.substring(0, closingIndex).replace(/<[^>]*>/g, '').trim();
      let rawBody = part.substring(closingIndex + 5).replace(/^<\/p>/i, '').replace(/<p>\s*<\/p>/gi, '').trim();

      const bodyHtml = this.formatBodyContent(rawBody);

      // Clean title text for sidebar menu
      const cleanTitle = titleText.replace(/^\d+[\.\-]\s*/, '').replace(/^#+\s*/, '');

      if (cleanTitle || bodyHtml) {
        sections.push({
          id: `section-${secIndex}`,
          title: cleanTitle || titleText || `قسم ${secIndex}`,
          htmlContent: this.sanitizer.bypassSecurityTrustHtml(bodyHtml),
          isIntro: false,
          index: secIndex
        });
        secIndex++;
      }
    }

    if (sections.length === 0) {
      sections.push({
        id: 'intro',
        title: 'مقدمة',
        htmlContent: this.sanitizer.bypassSecurityTrustHtml(text),
        isIntro: true,
        index: 0
      });
    }

    return sections;
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
            this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.content);
            this.lastUpdated = res.last_updated || '';
            this.sections = this.parseSections(this.content);
          }
        },
        error: (err) => {
          console.error('Error loading terms:', err);
          this.content = 'عذراً، فشل تحميل الشروط والأحكام حالياً. يرجى المحاولة لاحقاً.';
          this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.content);
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
            this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.content);
            this.lastUpdated = res.last_updated || '';
            this.sections = this.parseSections(this.content);
          }
        },
        error: (err) => {
          console.error('Error loading privacy:', err);
          this.content = 'عذراً، فشل تحميل سياسة الخصوصية حالياً. يرجى المحاولة لاحقاً.';
          this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.content);
          this.sections = this.parseSections(this.content);
        }
      });
    } else if (this.type === 'about') {
      this.title = 'من نحن';
      this.subtitle = 'تطبيق سعودي متكامل من قلب السعودية';
      this.settingsService.getPublicAboutUs('ar').subscribe({
        next: (res) => {
          if (res && res.data) {
            this.content = res.data;
            this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.content);
            this.lastUpdated = res.last_updated || '';
            this.sections = this.parseSections(this.content);
          }
        },
        error: (err) => {
          console.error('Error loading about us:', err);
          this.content = 'عذراً، فشل تحميل معلومات من نحن حالياً. يرجى المحاولة لاحقاً.';
          this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.content);
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
      this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.content);
      this.sections = this.parseSections(this.content);
    }
  }
}
