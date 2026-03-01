import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private dark = false;
  constructor() {
    const saved = localStorage.getItem('darkMode');
    this.dark = saved !== 'false';
    this.applyTheme();
  }
  toggle() {
    this.dark = !this.dark;
    localStorage.setItem('darkMode', String(this.dark));
    this.applyTheme();
  }
  applyTheme() {
    if (this.dark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
  isDark() {
    return this.dark;
  }
}
