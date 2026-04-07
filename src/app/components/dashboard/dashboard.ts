import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { Sidebar } from '../sidebar/sidebar';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Navbar, Sidebar, RouterModule, CommonModule, TranslateModule, ConfirmDialog],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {
  isCollapsed = false;
  isDarkMode = false;
  ngOnInit() {
    this.isDarkMode = localStorage.getItem('darkMode') !== 'false';
    this.applyDarkMode(this.isDarkMode);
    if (window.innerWidth <= 768) {
      this.isCollapsed = true;
    }
  }
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
  onDarkModeChange(enabled: boolean) {
    this.isDarkMode = enabled;
    this.applyDarkMode(enabled);
  }
  applyDarkMode(enable: boolean) {
    const layout = document.querySelector('.dashboard-layout');
    if (layout) {
      layout.classList.toggle('dark-mode', enable);
    }
  }
}
