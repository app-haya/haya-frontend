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
  type: 'terms' | 'privacy' | 'about' = 'terms';
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
    }
  }
}
