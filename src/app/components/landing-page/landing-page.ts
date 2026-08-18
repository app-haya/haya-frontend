import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPage implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  isMobileMenuOpen = false;
  isDarkMode = false;
  private langSub?: Subscription;

  constructor(public translate: TranslateService) {}

  ngOnInit() {
    this.isDarkMode = localStorage.getItem('lp_theme') === 'dark' || localStorage.getItem('darkMode') === 'true';
    this.applyTheme();
    this.updateDir();
    this.loadLocalizedData();
    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.updateDir();
      this.loadLocalizedData();
    });
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('lp_theme', this.isDarkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', String(this.isDarkMode));
    this.applyTheme();
  }

  openHayaApp(event: Event) {
    event.preventDefault();
    const deepLink = 'hayaapp://chat';
    const start = Date.now();
    window.location.href = deepLink;

    setTimeout(() => {
      if (Date.now() - start < 2000) {
        const downloadSec = document.querySelector('.lp-download__store-btns, .lp-download__store-btn-full');
        if (downloadSec) {
          downloadSec.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 1500);
  }

  private applyTheme() {
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  ngOnDestroy() {
    if (this.langSub) {
      this.langSub.unsubscribe();
    }
  }

  getCurrentLang(): string {
    return this.translate.currentLang || localStorage.getItem('lang') || 'ar';
  }

  getCurrentDir(): string {
    return this.getCurrentLang() === 'ar' ? 'rtl' : 'ltr';
  }

  toggleLanguage() {
    const current = this.getCurrentLang();
    const nextLang = current === 'ar' ? 'en' : 'ar';
    this.translate.use(nextLang);
    localStorage.setItem('lang', nextLang);
    this.updateDir(nextLang);
  }

  private updateDir(lang?: string) {
    const currentLang = lang || this.getCurrentLang();
    document.body.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
    const bsLink = document.getElementById('bootstrap-css') as HTMLLinkElement;
    if (bsLink) {
      bsLink.href = currentLang === 'ar'
        ? 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css'
        : 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  stats: { value: string; label: string }[] = [];
  features: { icon: string; title: string; desc: string }[] = [];
  howItWorks: { step: string; icon: string; title: string; desc: string }[] = [];
  topUsers: { icon: string; title: string; desc: string }[] = [];
  whyHaya: { icon: string; title: string; desc: string }[] = [];
  merchantBenefits: { icon: string; title: string; desc: string; isImage: boolean }[] = [];

  loadLocalizedData() {
    this.stats = [
      { value: '2M+', label: this.translate.instant('LANDING.SERVICES.STAT1_LABEL') },
      { value: '500+', label: this.translate.instant('LANDING.SERVICES.STAT2_LABEL') },
      { value: '50+', label: this.translate.instant('LANDING.SERVICES.STAT3_LABEL') },
      { value: '98%', label: this.translate.instant('LANDING.SERVICES.STAT4_LABEL') },
    ];

    this.features = [
      { icon: 'bi-play-circle', title: this.translate.instant('LANDING.ABOUT.CARD1_TITLE'), desc: this.translate.instant('LANDING.ABOUT.CARD1_DESC') },
      { icon: 'bi-geo-alt', title: this.translate.instant('LANDING.ABOUT.CARD2_TITLE'), desc: this.translate.instant('LANDING.ABOUT.CARD2_DESC') },
      { icon: 'bi-trophy', title: this.translate.instant('LANDING.ABOUT.CARD3_TITLE'), desc: this.translate.instant('LANDING.ABOUT.CARD3_DESC') },
    ];

    this.howItWorks = [
      { step: '1', icon: 'bi-person-check', title: this.translate.instant('LANDING.HOW.STEP1_TITLE'), desc: this.translate.instant('LANDING.HOW.STEP1_DESC') },
      { step: '2', icon: 'bi-chat-dots', title: this.translate.instant('LANDING.HOW.STEP2_TITLE'), desc: this.translate.instant('LANDING.HOW.STEP2_DESC') },
      { step: '3', icon: 'bi-collection', title: this.translate.instant('LANDING.HOW.STEP3_TITLE'), desc: this.translate.instant('LANDING.HOW.STEP3_DESC') },
      { step: '4', icon: 'bi-box-arrow-in-right', title: this.translate.instant('LANDING.HOW.STEP4_TITLE'), desc: this.translate.instant('LANDING.HOW.STEP4_DESC') },
      { step: '5', icon: 'bi-trophy', title: this.translate.instant('LANDING.HOW.STEP5_TITLE'), desc: this.translate.instant('LANDING.HOW.STEP5_DESC') }
    ];

    this.topUsers = [
      {
        icon: '/images/المستخدم يحصد النقاط.svg',
        title: this.translate.instant('LANDING.HOW.USER_TITLE'),
        desc: this.translate.instant('LANDING.HOW.USER_DESC')
      },
      {
        icon: '/images/التاجر يوزع النقاط.svg',
        title: this.translate.instant('LANDING.HOW.MERCHANT_TITLE'),
        desc: this.translate.instant('LANDING.HOW.MERCHANT_DESC')
      }
    ];

    this.whyHaya = [
      { icon: 'bi-graph-up-arrow', title: this.translate.instant('LANDING.WHY.CARD1_TITLE'), desc: this.translate.instant('LANDING.WHY.CARD1_DESC') },
      { icon: 'bi-building', title: this.translate.instant('LANDING.WHY.CARD2_TITLE'), desc: this.translate.instant('LANDING.WHY.CARD2_DESC') },
      { icon: 'bi-bar-chart', title: this.translate.instant('LANDING.WHY.CARD3_TITLE'), desc: this.translate.instant('LANDING.WHY.CARD3_DESC') },
      { icon: 'bi-flag', title: this.translate.instant('LANDING.WHY.CARD4_TITLE'), desc: this.translate.instant('LANDING.WHY.CARD4_DESC') }
    ];

    this.merchantBenefits = [
      {
        icon: 'bi-graph-up-arrow',
        title: this.translate.instant('LANDING.BENEFITS.CARD1_TITLE'),
        desc: this.translate.instant('LANDING.BENEFITS.CARD1_DESC'),
        isImage: false
      },
      {
        icon: 'bi-people',
        title: this.translate.instant('LANDING.BENEFITS.CARD2_TITLE'),
        desc: this.translate.instant('LANDING.BENEFITS.CARD2_DESC'),
        isImage: false
      },
      {
        icon: 'bi-bullseye',
        title: this.translate.instant('LANDING.BENEFITS.CARD3_TITLE'),
        desc: this.translate.instant('LANDING.BENEFITS.CARD3_DESC'),
        isImage: false
      },
      {
        icon: 'bi-bar-chart-line',
        title: this.translate.instant('LANDING.BENEFITS.CARD4_TITLE'),
        desc: this.translate.instant('LANDING.BENEFITS.CARD4_DESC'),
        isImage: false
      },
      {
        icon: 'bi-code-slash',
        title: this.translate.instant('LANDING.BENEFITS.CARD5_TITLE'),
        desc: this.translate.instant('LANDING.BENEFITS.CARD5_DESC'),
        isImage: false
      },
      {
        icon: '/images/تواجد عالمي.svg',
        title: this.translate.instant('LANDING.BENEFITS.CARD6_TITLE'),
        desc: this.translate.instant('LANDING.BENEFITS.CARD6_DESC'),
        isImage: true
      }
    ];
  }

  getMarqueeText(): string {
    const items = this.translate.instant('LANDING.DOWNLOAD.BANNER_ITEMS');
    if (!Array.isArray(items)) {
      return this.getCurrentLang() === 'en'
        ? 'Download App &nbsp;&nbsp;◆&nbsp;&nbsp; Sign In &nbsp;&nbsp;◆&nbsp;&nbsp; Enjoy &nbsp;&nbsp;◆&nbsp;&nbsp; Interact &nbsp;&nbsp;◆&nbsp;&nbsp; Order &nbsp;&nbsp;◆&nbsp;&nbsp; Compete &nbsp;&nbsp;◆&nbsp;&nbsp; Enjoy &nbsp;&nbsp;◆&nbsp;&nbsp;'
        : 'حمل التطبيق &nbsp;&nbsp;◆&nbsp;&nbsp; سجل دخول &nbsp;&nbsp;◆&nbsp;&nbsp; إستمتع &nbsp;&nbsp;◆&nbsp;&nbsp; تفاعل &nbsp;&nbsp;◆&nbsp;&nbsp; أطلب &nbsp;&nbsp;◆&nbsp;&nbsp; نافس &nbsp;&nbsp;◆&nbsp;&nbsp; إستمتع &nbsp;&nbsp;◆&nbsp;&nbsp;';
    }
    const phrase = items.join(' &nbsp;&nbsp;◆&nbsp;&nbsp; ') + ' &nbsp;&nbsp;◆&nbsp;&nbsp; ';
    return phrase.repeat(3);
  }
}
