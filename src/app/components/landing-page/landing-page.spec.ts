import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPage } from './landing-page';
import { RouterModule } from '@angular/router';

describe('LandingPage - Merchant Benefits Section', () => {
  let component: LandingPage;
  let fixture: ComponentFixture<LandingPage>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPage, RouterModule.forRoot([])]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPage);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  describe('Component Data', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have merchantBenefits array with 6 items', () => {
      expect(component.merchantBenefits).toBeDefined();
      expect(component.merchantBenefits.length).toBe(6);
    });

    it('should have correct benefit titles', () => {
      const expectedTitles = [
        'زيادة المبيعات',
        'مجتمع مخصص',
        'إعلانات مستهدفة',
        'تقارير فورية',
        'توسع تقني',
        'تواجد عالمي'
      ];

      component.merchantBenefits.forEach((benefit, index) => {
        expect(benefit.title).toBe(expectedTitles[index]);
      });
    });

    it('should have correct benefit descriptions', () => {
      const expectedDescriptions = [
        'تحويل متابعيك التلقائي إلى عملاء حقيقيين لمتجرك',
        'بناء علاقة طويلة الأمد مع عملائك عبر النشاط',
        'الوصول للجمهور المناسب في الوقت المناسب',
        'لوحة بيانات لمتابعة أداء حملاتك بدقة متناهية',
        'حلول API مرنة تتناسب مع جميع أحجام الشركات',
        'الإنضمام لمنصة تستهدف السوق العالمي منذ اليوم الأول'
      ];

      component.merchantBenefits.forEach((benefit, index) => {
        expect(benefit.desc).toBe(expectedDescriptions[index]);
      });
    });

    it('should have Bootstrap icon classes for each benefit', () => {
      const expectedIcons = [
        'bi-graph-up-arrow',
        'bi-people',
        'bi-bullseye',
        'bi-bar-chart-line',
        'bi-code-slash',
        'bi-globe'
      ];

      component.merchantBenefits.forEach((benefit, index) => {
        expect(benefit.icon).toBe(expectedIcons[index]);
      });
    });
  });

  describe('DOM Rendering', () => {
    it('should render merchant benefits section', () => {
      const section = compiled.querySelector('.lp-merchant-benefits');
      expect(section).toBeTruthy();
    });

    it('should render section title', () => {
      const title = compiled.querySelector('.lp-merchant-benefits__main-title');
      expect(title).toBeTruthy();
      expect(title?.textContent?.trim()).toBe('مزايا وحلول التجار');
    });

    it('should render sparkle decoration', () => {
      const sparkle = compiled.querySelector('.lp-merchant-benefits__sparkle');
      expect(sparkle).toBeTruthy();
      expect(sparkle?.textContent).toBe('✦');
    });

    it('should render 6 benefit cards', () => {
      const cards = compiled.querySelectorAll('.lp-merchant-benefits__card');
      expect(cards.length).toBe(6);
    });

    it('should render icon for each card', () => {
      const icons = compiled.querySelectorAll('.lp-merchant-benefits__icon');
      expect(icons.length).toBe(6);
    });

    it('should render Bootstrap icon classes', () => {
      const iconElements = compiled.querySelectorAll('.lp-merchant-benefits__icon i');
      expect(iconElements.length).toBe(6);
      
      iconElements.forEach((icon) => {
        expect(icon.classList.contains('bi')).toBe(true);
      });
    });

    it('should have aria-hidden on decorative icons', () => {
      const icons = compiled.querySelectorAll('.lp-merchant-benefits__icon i');
      icons.forEach((icon) => {
        expect(icon.getAttribute('aria-hidden')).toBe('true');
      });
    });

    it('should render title for each card', () => {
      const titles = compiled.querySelectorAll('.lp-merchant-benefits__title');
      expect(titles.length).toBe(6);
    });

    it('should render description for each card', () => {
      const descriptions = compiled.querySelectorAll('.lp-merchant-benefits__desc');
      expect(descriptions.length).toBe(6);
    });
  });

  describe('Section Placement', () => {
    it('should render after "Why Haya" section', () => {
      const whySection = compiled.querySelector('.lp-why');
      const merchantSection = compiled.querySelector('.lp-merchant-benefits');
      
      expect(whySection).toBeTruthy();
      expect(merchantSection).toBeTruthy();
      
      // Check that merchant benefits comes after why section in DOM
      const allSections = Array.from(compiled.querySelectorAll('section'));
      const whyIndex = allSections.findIndex(s => s.classList.contains('lp-why'));
      const merchantIndex = allSections.findIndex(s => s.classList.contains('lp-merchant-benefits'));
      
      expect(merchantIndex).toBeGreaterThan(whyIndex);
    });

    it('should render before "Download" section', () => {
      const merchantSection = compiled.querySelector('.lp-merchant-benefits');
      const downloadSection = compiled.querySelector('.lp-download');
      
      expect(merchantSection).toBeTruthy();
      expect(downloadSection).toBeTruthy();
      
      // Check that merchant benefits comes before download section in DOM
      const allSections = Array.from(compiled.querySelectorAll('section'));
      const merchantIndex = allSections.findIndex(s => s.classList.contains('lp-merchant-benefits'));
      const downloadIndex = allSections.findIndex(s => s.classList.contains('lp-download'));
      
      expect(merchantIndex).toBeLessThan(downloadIndex);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const mainTitle = compiled.querySelector('.lp-merchant-benefits__main-title');
      const cardTitles = compiled.querySelectorAll('.lp-merchant-benefits__title');
      
      expect(mainTitle?.tagName).toBe('H2');
      cardTitles.forEach((title) => {
        expect(title.tagName).toBe('H3');
      });
    });

    it('should have section id for navigation', () => {
      const section = compiled.querySelector('.lp-merchant-benefits');
      expect(section?.getAttribute('id')).toBe('merchant-benefits');
    });

    it('should have RTL direction', () => {
      const root = compiled.querySelector('.lp-root');
      expect(root?.getAttribute('dir')).toBe('rtl');
    });
  });

  describe('CSS Classes', () => {
    it('should apply correct BEM classes to section', () => {
      const section = compiled.querySelector('.lp-merchant-benefits');
      expect(section).toBeTruthy();
    });

    it('should apply correct BEM classes to grid', () => {
      const grid = compiled.querySelector('.lp-merchant-benefits__grid');
      expect(grid).toBeTruthy();
    });

    it('should apply correct BEM classes to cards', () => {
      const cards = compiled.querySelectorAll('.lp-merchant-benefits__card');
      expect(cards.length).toBe(6);
    });

    it('should apply correct BEM classes to icons', () => {
      const icons = compiled.querySelectorAll('.lp-merchant-benefits__icon');
      expect(icons.length).toBe(6);
    });

    it('should apply correct BEM classes to titles', () => {
      const titles = compiled.querySelectorAll('.lp-merchant-benefits__title');
      expect(titles.length).toBe(6);
    });

    it('should apply correct BEM classes to descriptions', () => {
      const descriptions = compiled.querySelectorAll('.lp-merchant-benefits__desc');
      expect(descriptions.length).toBe(6);
    });
  });
});
