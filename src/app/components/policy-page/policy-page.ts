import { Component, OnInit, OnDestroy, HostListener, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SettingsService } from '../../services/settings.service';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

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
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './policy-page.html',
  styleUrl: './policy-page.css',
  encapsulation: ViewEncapsulation.None
})
export class PolicyPage implements OnInit, OnDestroy {
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
  openHayaApp(event: Event) {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    let targetUrl = 'hayaapp://chat';
    if (isAndroid) {
      targetUrl = 'intent://chat#Intent;scheme=hayaapp;package=com.osus.haya;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.haya.haya;end';
    }

    window.location.href = targetUrl;

    const start = Date.now();
    setTimeout(() => {
      if (Date.now() - start < 2000) {
        if (isIOS) {
          window.location.href = 'https://apps.apple.com/sa/app/haya/id6796128618';
        } else if (isAndroid) {
          window.location.href = 'https://play.google.com/store/apps/details?id=com.haya.haya';
        } else {
          const downloadSec = document.querySelector('.lp-footer__download, .lp-download__store-btns');
          if (downloadSec) {
            downloadSec.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    }, 1200);
  }
  isEn = false;
  isDarkMode = false;
  private langSub?: Subscription;
  private querySub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private settingsService: SettingsService,
    private sanitizer: DomSanitizer,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.isDarkMode = localStorage.getItem('lp_theme') === 'dark' || localStorage.getItem('darkMode') === 'true';
    this.applyTheme();

    this.route.data.subscribe(data => {
      this.type = data['type'];
      this.loadContent();
    });

    this.querySub = this.route.queryParams.subscribe(() => {
      this.loadContent();
    });

    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.loadContent();
    });
  }

  ngOnDestroy() {
    if (this.langSub) {
      this.langSub.unsubscribe();
    }
    if (this.querySub) {
      this.querySub.unsubscribe();
    }
  }

  getCurrentLang(): string {
    const qLang = this.route.snapshot.queryParams['lang'];
    if (qLang && (qLang === 'en' || qLang === 'ar')) {
      return qLang;
    }
    return this.translate.currentLang || localStorage.getItem('lang') || 'en';
  }

  toggleLanguage() {
    const nextLang = this.isEn ? 'ar' : 'en';
    this.translate.use(nextLang);
    localStorage.setItem('lang', nextLang);
    document.body.setAttribute('dir', nextLang === 'ar' ? 'rtl' : 'ltr');
    const bsLink = document.getElementById('bootstrap-css') as HTMLLinkElement;
    if (bsLink) {
      bsLink.href = nextLang === 'ar' 
        ? 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css' 
        : 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
    }
    this.loadContent();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('lp_theme', this.isDarkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', String(this.isDarkMode));
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
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

  parseSections(rawText: string, lang: string = 'ar'): PolicySection[] {
    if (!rawText) return [];
    
    const isEnglish = lang === 'en';
    const introTitle = isEnglish ? 'Introduction' : 'مقدمة';
    const sectionPrefix = isEnglish ? 'Section' : 'قسم';

    // Clean out footer link if present in rawText
    let text = rawText
      .replace(/<p>\s*تبحث عن معلومات أخرى؟.*?<\/p>/gi, '')
      .replace(/تبحث عن معلومات أخرى؟.*/gi, '')
      .replace(/<p>\s*Looking for other information\?.*?<\/p>/gi, '')
      .replace(/Looking for other information\?.*/gi, '');

    // Normalize existing HTML headings h1, h3, h4, h5, h6 to h2
    text = text.replace(/<h[13456][^>]*>(.*?)<\/h[13456]>/gi, '<h2>$1</h2>');

    // Comprehensive list of known Arabic & English policy section heading phrases
    const knownHeadings = [
      // English headings
      'Information We Collect',
      'Data We Collect',
      'How We Use Your Information',
      'How We Use Your Data',
      'How We Use Information',
      'Data Sharing and Protection',
      'Data Sharing & Protection',
      'Data Sharing',
      'User Rights and Data Control',
      'User Rights',
      'Data Security and Protection',
      'Data Security',
      'Security',
      'Cookies and Tracking',
      'Cookies',
      'Changes to Privacy Policy',
      'Changes to This Policy',
      'Acceptance of Terms and Conditions',
      'Acceptance of Terms',
      'Account Terms and Security',
      'Account Security',
      'Account Terms',
      'Eligibility',
      'Prohibited Conduct and Content',
      'Prohibited Content',
      'Commercial Transactions and Bookings',
      'Commercial Transactions',
      'Content You Post',
      'Accounts',
      'Penalties and Measures',
      'Top 30 Policy',
      'Fair Competition',
      'Anti-Fraud',
      'Final Decisions',
      'Features',
      'Create Merchant Account',
      'API Integration Guide',
      'Merchant Dashboard',
      'Technical Support',
      // Arabic headings
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

    // 2. Match any remaining short title (1 to 6 words) after #
    text = text.replace(/(?:---|--|:\s*)*#\s*([a-zA-Z0-9\u0600-\u06FF\w\s\-\,\.\&\?]{2,45})(?=\s+[a-zA-Z0-9\u0600-\u06FF]{3,}|\n|$)/gi, (match, title) => {
      const words = title.trim().split(/\s+/);
      if (words.length <= 6) {
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
        title: introTitle,
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
        title: introTitle,
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

      // If titleText is excessively long, extract short heading and move extra text to body
      if (titleText.length > 60 || (titleText.length > 35 && (titleText.includes('.') || titleText.includes('!') || titleText.includes('?')))) {
        let breakIdx = -1;
        const match = titleText.match(/[:\.\!\?\n]/);
        if (match && match.index !== undefined && match.index > 3 && match.index < 60) {
          breakIdx = match.index + (match[0] === ':' ? 1 : 0);
        } else if (titleText.length > 50) {
          const lastSpace = titleText.substring(0, 50).lastIndexOf(' ');
          if (lastSpace > 10) {
            breakIdx = lastSpace;
          }
        }

        if (breakIdx > 0) {
          const extractedTitle = titleText.substring(0, breakIdx).trim();
          const extraContent = titleText.substring(breakIdx).trim();
          titleText = extractedTitle;
          if (extraContent) {
            rawBody = `<p>${extraContent}</p>` + rawBody;
          }
        }
      }

      const bodyHtml = this.formatBodyContent(rawBody);

      // Clean title text for sidebar menu
      const cleanTitle = titleText.replace(/^\d+[\.\-]\s*/, '').replace(/^#+\s*/, '');

      if (cleanTitle || bodyHtml) {
        sections.push({
          id: `section-${secIndex}`,
          title: cleanTitle || titleText || `${sectionPrefix} ${secIndex}`,
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
        title: introTitle,
        htmlContent: this.sanitizer.bypassSecurityTrustHtml(text),
        isIntro: true,
        index: 0
      });
    }

    return sections;
  }

  loadContent() {
    const lang = this.getCurrentLang();
    this.isEn = lang === 'en';
    this.lastUpdated = '';
    this.sections = [];
    this.activeSectionId = 'intro';
    
    if (this.type === 'terms') {
      this.title = this.isEn ? 'Terms & Conditions' : 'الشروط والأحكام';
      this.subtitle = this.isEn
        ? 'We are here to ensure a safe and premium experience for all Haya users. Please read this agreement to understand your rights and obligations.'
        : 'نحن هنا لضمان تجربة آمنة وراقية لجميع مستخدمي هيا. يرجى قراءة هذه الاتفاقية لفهم التزاماتكم وحقوقكم.';
      
      this.settingsService.getPublicTerms(lang).subscribe({
        next: (res) => {
          if (res && res.data) {
            this.content = res.data;
            this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.content);
            this.lastUpdated = res.last_updated || '';
            this.sections = this.parseSections(this.content, lang);
          }
        },
        error: (err) => {
          console.error('Error loading terms:', err);
          this.content = this.isEn
            ? 'Sorry, failed to load Terms and Conditions at this time. Please try again later.'
            : 'عذراً، فشل تحميل الشروط والأحكام حالياً. يرجى المحاولة لاحقاً.';
          this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.content);
          this.sections = this.parseSections(this.content, lang);
        }
      });
    } else if (this.type === 'privacy') {
      this.title = this.isEn ? 'Privacy Policy' : 'سياسة الخصوصية';
      this.subtitle = this.isEn
        ? 'At Haya, we are committed to protecting your privacy and ensuring the security of your personal data as an integral part of our authentic Saudi identity.'
        : 'نحن في هيّا نلتزم بحماية خصوصيتك وضمان أمان بياناتك الشخصية كجزء لا يتجزأ من هويتنا السعودية العريقة.';
      
      this.settingsService.getPublicPrivacy(lang).subscribe({
        next: (res) => {
          if (res && res.data) {
            this.content = res.data;
            this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.content);
            this.lastUpdated = res.last_updated || '';
            this.sections = this.parseSections(this.content, lang);
          }
        },
        error: (err) => {
          console.error('Error loading privacy:', err);
          this.content = this.isEn
            ? 'Sorry, failed to load Privacy Policy at this time. Please try again later.'
            : 'عذراً، فشل تحميل سياسة الخصوصية حالياً. يرجى المحاولة لاحقاً.';
          this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.content);
          this.sections = this.parseSections(this.content, lang);
        }
      });
    } else if (this.type === 'about') {
      this.title = this.isEn ? 'About Us' : 'من نحن';
      this.subtitle = this.isEn
        ? 'An integrated Saudi application from the heart of Saudi Arabia'
        : 'تطبيق سعودي متكامل من قلب السعودية';
      
      this.settingsService.getPublicAboutUs(lang).subscribe({
        next: (res) => {
          if (res && res.data) {
            this.content = res.data;
            this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.content);
            this.lastUpdated = res.last_updated || '';
            this.sections = this.parseSections(this.content, lang);
          }
        },
        error: (err) => {
          console.error('Error loading about us:', err);
          this.content = this.isEn
            ? 'Sorry, failed to load About Us information at this time. Please try again later.'
            : 'عذراً، فشل تحميل معلومات من نحن حالياً. يرجى المحاولة لاحقاً.';
          this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.content);
          this.sections = this.parseSections(this.content, lang);
        }
      });
    } else if (this.type === 'merchant') {
      this.title = this.isEn ? 'Connect Your Store with Haya' : 'ربط متجرك مع هيّا';
      this.subtitle = this.isEn
        ? 'Expand your sales by connecting your store with Haya app via API, enabling seamless product and order synchronization.'
        : 'وسّع نطاق مبيعاتك من خلال ربط متجرك مع تطبيق هيّا عبر واجهة برمجة التطبيقات (API)، وتمكين مزامنة المنتجات والطلبات بسهولة وأمان.';
      this.lastUpdated = this.isEn ? 'Last updated May 17, 2026' : 'آخر تحديث في 17 مايو 2026';
      
      if (this.isEn) {
        this.content = `Welcome to the Haya Developers page.
The Haya app provides an API that allows e-commerce stores to directly connect their systems with the app, facilitating automated and smooth product and order management.

# Features
Direct API integration.
Automatic product synchronization.
Instant order receiving.
Order status updates.
Secure authentication using API Key.
Fast integration with various systems.

# Create Merchant Account
Before starting the integration process, you must create a merchant account inside the Haya app.
Account creation steps:
Download Haya app.
Create an account using phone number.
Go to profile.
Fill in business details.
Wait for approval.
[button:Download App]

# API Integration Guide
Cashier login route:
POST /api/v1/cashier/login
Parameters: email (optional), phone (optional if no email), password (cashier password)

Customer lookup route:
GET /api/v1/cashier/customers/lookup?phone=966xxxxxxxx
Parameters: phone (customer phone number)

Create invoice route:
POST /api/v1/cashier/invoices
Parameters: phone (customer phone), invoice_number (invoice number), amount (invoice value in SAR)

# Merchant Dashboard
If you don't have an online store system with API support, contact us and the Haya team will activate a dedicated dashboard for your business.
Contact us via:
Official account +966 59 690 4229.

# Top 30 Policy
Fair Competition: Points are calculated based on genuine user activities inside the application.
Anti-Fraud: Using external tools, exploits, or fake accounts to inflate points is strictly prohibited.
Penalties: Haya management reserves the right to reset points or permanently ban violating accounts.
Final Decisions: Top 30 leaderboard results declared at month-end are final.

# Technical Support
If you have any inquiries or complaints, contact us on +966 59 690 4229.`;
      } else {
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
الحساب الرسمي هيّا +966 59 690 4229.

# سياسة توب 30
عدالة التنافس: يتم احتساب النقاط بناءً على الأنشطة الحقيقية والمشروعة للمستخدم داخل التطبيق (التفاعل، الاستخدام، المعاملات).
مكافحة الاحتيال: يُحظر حظراً تاماً استخدام أي برمجيات خارجية، ثغرات، حسابات وهمية، أو أساليب تلاعب لزيادة النقاط وتصدر قائمة التوب 30.
العقوبات والإجراءات: في حال رصد أي سلوك مشبوه أو محاولة غش، تمتلك إدارة هيّا الحق المطلق في تصفير نقاط الحساب فوراً، الحرمان النهائي من الجوائز الشهرية، أو حظر الحساب بشكل دائم دون أدنى مسؤولية قانونية أو مالية على التطبيق.
القرارات النهائية: تعتبر لوحة الصدارة لـ توب 30 المعلنة نهاية كل شهر ميلادي قطعية ولا يجوز الطعن فيها بعد مراجعتها تقنياً من فريق الدعم.

# الدعم الفني
إذا كان لديك أي استفسارات أو شكاوى أو اقتراحات، يمكنك التواصل معنا على الرقم +966 59 690 4229. سنبذل قصارى جهدنا لمعالجة شكواك في أسرع فرصة.`;
      }
      this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.content);
      this.sections = this.parseSections(this.content, lang);
    }
  }
}

