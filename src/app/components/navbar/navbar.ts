import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar {

  showLangDropdown = false;
  isDarkMode = false;

  constructor(
    public translate: TranslateService,
    private theme: ThemeService
  ) {}

  ngOnInit() {
    this.isDarkMode = this.theme.isDark();
  }

  toggleDropdown() {
    this.showLangDropdown = !this.showLangDropdown;
  }

  changeLang(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    document.body.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    this.showLangDropdown = false;
  }

  toggleDarkMode() {
    this.theme.toggle();
    this.isDarkMode = this.theme.isDark();
  }
}
