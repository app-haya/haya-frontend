import { Component } from '@angular/core';
import { Navbar } from '../navbar/navbar';
import { Sidebar } from '../sidebar/sidebar';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Navbar, Sidebar, RouterModule, CommonModule, TranslateModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {
  isCollapsed = false;
  isDarkMode = false;

  ngOnInit() {
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    this.applyDarkMode(this.isDarkMode);
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
