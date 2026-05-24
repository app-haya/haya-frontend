import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPage {
  currentYear = new Date().getFullYear();
  isMobileMenuOpen = false;

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  stats = [
    { value: '2M+', label: 'مستخدم نشط' },
    { value: '500+', label: 'تاجر موثّق' },
    { value: '50+', label: 'مدينة مغطّاة' },
    { value: '98%', label: 'رضا العملاء' },
  ];

  features = [
    { icon: 'bi-play-circle', title: 'محتوى إبداعي', desc: 'شارك إبداعك مع ملايين المستخدمين حول العالم' },
    { icon: 'bi-geo-alt', title: 'اكتشف الأماكن', desc: 'تعرّف على أفضل الأماكن والوجهات في مدينتك' },
    { icon: 'bi-trophy', title: 'المبدعون المميزون', desc: 'تصفّح أبرز المبدعين والمؤثرين في منصة حياة' },
    { icon: 'bi-person-badge', title: 'هوية موثّقة', desc: 'احصل على توثيق هويتك وابنِ مصداقيتك' },
    { icon: 'bi-hash', title: 'الوسوم والاهتمامات', desc: 'تابع المحتوى الذي يهمّك عبر الوسوم' },
    { icon: 'bi-chat-heart', title: 'تواصل اجتماعي', desc: 'تفاعل مع مجتمعك وابنِ علاقات حقيقية' },
    { icon: 'bi-calendar-check', title: 'الفعاليات', desc: 'لا تفوّت أي فعالية أو حدث في منطقتك' },
  ];

  howItWorks = [
    { 
      step: '1', 
      icon: 'bi-person-check', 
      title: 'سجل في هيّا', 
      desc: 'أنشئ ملفك الشخصي<br>وابدأ رحلتك الاستثنائية' 
    },
    { 
      step: '2', 
      icon: 'bi-chat-dots', 
      title: 'تفاعل وانشر', 
      desc: 'كل نشاطك جديد أو شراء<br>يمنحك نقاطاً تجريبية' 
    },
    { 
      step: '3', 
      icon: 'bi-collection', 
      title: 'إجمع النقاط', 
      desc: 'راقب نقو تجميع نقاطك<br>في خانة توب 30' 
    },
    { 
      step: '4', 
      icon: 'bi-box-arrow-in-right', 
      title: 'أدخل التحدي', 
      desc: 'تأهّل للتحويل إلى<br>أفضل 30 مستخدماً في منصتنا' 
    },
    { 
      step: '5', 
      icon: 'bi-trophy', 
      title: 'إربح الجوائز', 
      desc: 'جوائز شهرية ومكانة خاصة<br>وفرص استثنائية' 
    }
  ];

  topUsers = [
    {
      icon: '/images/المستخدم يحصد النقاط.svg',
      title: 'المستخدم يحصد النقاط',
      desc: 'من خلال التفاعل اليومي، الحجز، والدردشة والمشاركة،<br>يجمع المستخدم النقاط ليرتقي في الترتيب العالمي'
    },
    {
      icon: '/images/التاجر يوزع النقاط.svg',
      title: 'التاجر يوزع النقاط',
      desc: 'التاجر هو المحرك حيث يقدم النقاط كمكافأة للعملاء<br>عند الشراء أو استخدام الخدمات عبر API هيّا'
    }
  ];

  whyHaya = [
    { icon: 'bi-graph-up-arrow', title: 'نمو متسارع', desc: 'نموذج عمل قابل للتوسع عالمياً<br>إنطلاقاً من مركز القوة السعودي' },
    { icon: 'bi-building', title: 'بيئة متكاملة', desc: 'دمج التواصل الإجتماعي بالتجارة يخلق<br>قيمة مستدامة' },
    { icon: 'bi-bar-chart', title: 'بيانات عميقة', desc: 'تحليلات دقيقة لسلوك المستهلك تدعم<br>إتخاذ قرارات ذكية' },
    { icon: 'bi-flag', title: 'هوية فريدة', desc: 'استخدام التراث النجدي كقوة ناعمة في<br>التصميم والتقنية' },
  ];

  navLinks = [
    { label: 'الرئيسية', href: '#hero' },
    { label: 'من نحن', href: '#about' },
    { label: 'سياسة الخصوصية', href: '#privacy' },
    { label: 'الشروط والأحكام', href: '#terms' },
  ];

  merchantBenefits = [
    {
      icon: 'bi-graph-up-arrow',
      title: 'زيادة المبيعات',
      desc: 'تحويل متابعيك التلقائي إلى عملاء حقيقيين لمتجرك',
      isImage: false
    },
    {
      icon: 'bi-people',
      title: 'مجتمع مخصص',
      desc: 'بناء علاقة طويلة الأمد مع عملائك عبر النشاط',
      isImage: false
    },
    {
      icon: 'bi-bullseye',
      title: 'إعلانات مستهدفة',
      desc: 'الوصول للجمهور المناسب في الوقت المناسب',
      isImage: false
    },
    {
      icon: 'bi-bar-chart-line',
      title: 'تقارير فورية',
      desc: 'لوحة بيانات لمتابعة أداء حملاتك بدقة متناهية',
      isImage: false
    },
    {
      icon: 'bi-code-slash',
      title: 'توسع تقني',
      desc: 'حلول API مرنة تتناسب مع جميع أحجام الشركات',
      isImage: false
    },
    {
      icon: '/images/تواجد عالمي.svg',
      title: 'تواجد عالمي',
      desc: 'الإنضمام لمنصة تستهدف السوق العالمي منذ اليوم الأول',
      isImage: true
    }
  ];
}
