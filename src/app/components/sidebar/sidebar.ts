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
    { name: 'Dashboard', icon: 'bi bi-house-door', path: '/admin/dashboardcount' },
    { name: 'Admins', icon: 'bi bi-person-gear', path: '/admin/admins' },
    { name: 'Users', icon: 'bi bi-people', path: '/admin/users' },
    { name: 'Top Users Notes', icon: 'bi bi-trophy', path: '/admin/top-users-notes' },
    { name: 'Merchants', icon: 'bi bi-shop', path: '/admin/merchants' },
    { name: 'Governments', icon: 'bi bi-bank', path: '/admin/governments' },
    {
      name: 'Verifycation',
      icon: 'bi bi-bag-check',
      path: '/admin/verifycation',
      expanded: true,
      children: [
        { name: 'Verify Account', path: '/admin/verify_account', icon: 'bi bi-hourglass-split' },
        { name: 'Verify Creator', path: '/admin/verify_creator', icon: 'bi bi-hourglass-split' },
        { name: 'طلبات التوثيق المدفوعة', path: '/admin/verification-orders', icon: 'bi bi-credit-card-2-front' },
      ],
    },

    { name: 'Interests', icon: 'bi bi-star', path: '/admin/interests' },
    { name: 'Cities', icon: 'bi bi-geo-alt', path: '/admin/cities' },
    { name: 'Countries', icon: 'bi bi-globe', path: '/admin/countries' },
    { name: 'Deals', icon: 'bi bi-bag-check', path: '/admin/deals' },
    { name: 'Banned Words', icon: 'bi bi-slash-circle', path: '/admin/bannedwords' },
    { name: 'Wallet', icon: 'bi bi-wallet2', path: '/admin/wallet' },
    { name: 'Calendar', icon: 'bi bi-calendar-event', path: '/admin/calendar' },
    { name: 'SETTINGS', icon: 'bi bi-gear', path: '/admin/policy-settings' },
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
      this.router.navigate(['/login']);
      return;
    }
    this.authService.logout(token).subscribe({
      next: () => {
        localStorage.removeItem('admin_token');
        this.router.navigateByUrl('/login').then(() => {
          window.location.reload();
        });
      },
      error: () => {
        localStorage.removeItem('admin_token');
        this.router.navigateByUrl('/login').then(() => {
          window.location.reload();
        });
      },
    });
  }
}