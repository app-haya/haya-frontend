import { Component, OnInit } from '@angular/core';
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
  lastUpdated = 'آخر تحديث في 17 مايو 2026';
  isMobileMenuOpen = false;
  currentYear = new Date().getFullYear();

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

  loadContent() {
    if (this.type === 'terms') {
      this.title = 'الشروط والأحكام';
      this.subtitle = 'نحن هنا لضمان تجربة آمنة وراقية لجميع مستخدمي هيا. يرجى قراءة هذه الاتفاقية لفهم التزاماتكم وحقوقكم.';
      this.settingsService.getPublicTerms('ar').subscribe({
        next: (res) => {
          if (res && res.data) {
            this.content = res.data;
          }
        },
        error: (err) => {
          console.error('Error loading terms:', err);
          this.content = '<p class="text-center text-muted">عذراً، فشل تحميل الشروط والأحكام حالياً. يرجى المحاولة لاحقاً.</p>';
        }
      });
    } else if (this.type === 'privacy') {
      this.title = 'سياسة الخصوصية';
      this.subtitle = 'نحن في هيّا نلتزم بحماية خصوصيتك وضمان أمان بياناتك الشخصية كجزء لا يتجزأ من هويتنا السعودية العريقة.';
      this.settingsService.getPublicPrivacy('ar').subscribe({
        next: (res) => {
          if (res && res.data) {
            this.content = res.data;
          }
        },
        error: (err) => {
          console.error('Error loading privacy:', err);
          this.content = '<p class="text-center text-muted">عذراً، فشل تحميل سياسة الخصوصية حالياً. يرجى المحاولة لاحقاً.</p>';
        }
      });
    } else if (this.type === 'about') {
      this.title = 'من نحن';
      this.subtitle = 'تعرّف على منصة هيّا، مستقبل الخدمات الرقمية بروح تجديدية أصيلة.';
      this.settingsService.getPublicAboutUs('ar').subscribe({
        next: (res) => {
          if (res && res.data) {
            this.content = res.data;
          }
        },
        error: (err) => {
          console.error('Error loading about us:', err);
          this.content = '<p class="text-center text-muted">عذراً، فشل تحميل معلومات من نحن حالياً. يرجى المحاولة لاحقاً.</p>';
        }
      });
    }
  }
}
