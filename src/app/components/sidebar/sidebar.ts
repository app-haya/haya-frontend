import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf, NgClass } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, NgFor, NgIf, NgClass, TranslateModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar implements OnInit {
  @Input() isCollapsed = false;
  user: any = null;
  selectedChild: string = '';
  @Output() collapsedChange = new EventEmitter<boolean>();

  constructor(
    public translate: TranslateService,
    private authService: AuthService,
    private router: Router
  ) { }

  menu = [
    { name: 'Dashboard', icon: 'bi bi-house-door', path: '/dashboardcount' },
    { name: 'Admins', icon: 'bi bi-person-gear', path: '/admins' },
    { name: 'Users', icon: 'bi bi-people', path: '/users' },
    { name: 'Top Users Notes', icon: 'bi bi-trophy', path: '/top-users-notes' },
    { name: 'Merchants', icon: 'bi bi-shop', path: '/merchants' },
    { name: 'Governments', icon: 'bi bi-bank', path: '/governments' },
    {
      name: 'Verifycation',
      icon: 'bi bi-bag-check',
      path: '/verifycation',
      expanded: true,
      children: [
        { name: 'Verify Account', path: '/verify_account', icon: 'bi bi-hourglass-split' },
        { name: 'Verify Creator', path: '/verify_creator', icon: 'bi bi-hourglass-split' },
      ],
    },

    { name: 'Interests', icon: 'bi bi-star', path: '/interests' },
    { name: 'Cities', icon: 'bi bi-geo-alt', path: '/cities' },
    { name: 'Countries', icon: 'bi bi-globe', path: '/countries' },
    {
      name: 'Deals',
      icon: 'bi bi-bag-check',
      path: '/deals',
      expanded: true,
      children: [
        { name: 'Pending', path: '/deals', icon: 'bi bi-hourglass-split' },
        { name: 'Approved', path: 'approved', icon: 'bi bi-check-circle' },
        { name: 'Rejected', path: 'rejected', icon: 'bi bi-x-circle' },
      ],
    },
    { name: 'Banned Words', icon: 'bi bi-slash-circle', path: '/bannedwords' },
    { name: 'Gifts', icon: 'bi bi-gift', path: '/gifts' },
    { name: 'Wallet', icon: 'bi bi-wallet2', path: '/wallet' },
    { name: 'Calendar', icon: 'bi bi-calendar-event', path: '/calendar' },
    { name: 'SETTINGS', icon: 'bi bi-gear', path: '/policy-settings' },
  ];

  ngOnInit(): void {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    this.authService.getProfile(token).subscribe({
      next: (res) => {
        this.user = res.data || res.user || res;
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
      },
    });
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }

  toggleItem(item: any) {
    if (item.expanded) {
      item.expanded = false;
      return;
    }
    this.menu.forEach((m) => (m.expanded = false));
    item.expanded = true;
  }

  logout() {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      this.router.navigate(['/admin/login']);
      return;
    }
    this.authService.logout(token).subscribe({
      next: () => {
        localStorage.removeItem('admin_token');
        this.router.navigateByUrl('/admin/login').then(() => {
          window.location.reload();
        });
      },
      error: () => {
        localStorage.removeItem('admin_token');
        this.router.navigateByUrl('/admin/login').then(() => {
          window.location.reload();
        });
      },
    });
  }
}