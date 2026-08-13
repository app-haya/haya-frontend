import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf, NgClass } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { isSuperAdmin, getUserPermissions } from '../../utils/permission-helper';

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
    private dashboardService: DashboardService,
    private router: Router
  ) { }

  allMenu: any[] = [
    { name: 'Dashboard', icon: 'bi bi-house-door', path: '/admin/dashboardcount', perm: 'dashboard' },
    { name: 'Admins', icon: 'bi bi-person-gear', path: '/admin/admins', perm: 'admins' },
    { name: 'Users', icon: 'bi bi-people', path: '/admin/users', perm: 'users' },
    { name: 'Merchants', icon: 'bi bi-shop', path: '/admin/merchants', perm: 'merchants' },
    { name: 'Governments', icon: 'bi bi-bank', path: '/admin/governments', perm: 'governments' },
    {
      name: 'Verifycation',
      icon: 'bi bi-bag-check',
      path: '/admin/verifycation',
      perm: 'verification',
      expanded: true,
      children: [
        { name: 'Verify Creator', path: '/admin/verify_creator', icon: 'bi bi-hourglass-split' },
        { name: 'Paid Verification Requests', path: '/admin/verification-orders', icon: 'bi bi-credit-card-2-front' },
        { name: 'VERIFICATION_PRICES', path: '/admin/verification-prices', icon: 'bi bi-tags' },
      ],
    },
    { name: 'Top Users Notes', icon: 'bi bi-trophy', path: '/admin/top-users-notes', perm: 'top30' },
    { name: 'Loyalty Management', icon: 'bi bi-award', path: '/admin/loyalty', perm: 'loyalty' },
    {
      name: 'Deals',
      icon: 'bi bi-bag-check',
      path: '/admin/deals',
      perm: 'deals',
      expanded: false,
      children: [
        { name: 'Deals List', path: '/admin/deals', icon: 'bi bi-list-task' },
        { name: 'Deal Orders', path: '/admin/deal-orders', icon: 'bi bi-cart-check' },
      ],
    },

    { name: 'Interests', icon: 'bi bi-star', path: '/admin/interests', perm: 'interests' },
    { name: 'Cities', icon: 'bi bi-geo-alt', path: '/admin/cities', perm: 'cities' },
    { name: 'Countries', icon: 'bi bi-globe', path: '/admin/countries', perm: 'countries' },
    { name: 'Banned Words', icon: 'bi bi-slash-circle', path: '/admin/bannedwords', perm: 'banned_words' },
    {
      name: 'Reports',
      icon: 'bi bi-flag',
      path: '/admin/comment-reports',
      perm: 'reports',
      expanded: false,
      children: [
        { name: 'Comment Reports', path: '/admin/comment-reports', icon: 'bi bi-chat-right-quote' },
        { name: 'Post Reports', path: '/admin/post-reports', icon: 'bi bi-file-earmark-post' },
      ],
    },
    {
      name: 'Support System',
      icon: 'bi bi-headset',
      path: '/admin/support-departments',
      perm: 'support',
      expanded: false,
      children: [
        { name: 'Support Settings & Departments', path: '/admin/support-departments', icon: 'bi bi-diagram-3' },
        { name: 'Support Conversations', path: '/admin/support-chats', icon: 'bi bi-chat-dots' },
      ],
    },
    { name: 'Wallet', icon: 'bi bi-wallet2', path: '/admin/wallet', perm: 'wallet' },
    { name: 'Calendar', icon: 'bi bi-calendar-event', path: '/admin/calendar', perm: 'calendar' },
    { name: 'SEND_NOTIFICATIONS', icon: 'bi bi-bell', path: '/admin/send-notifications', perm: 'notifications' },
    { name: 'SETTINGS', icon: 'bi bi-gear', path: '/admin/policy-settings', perm: 'settings' },
    { name: 'Profile', icon: 'bi bi-person-circle', path: '/admin/profile' },
  ];

  menu: any[] = [];

  ngOnInit(): void {
    this.menu = [...this.allMenu];
    
    this.authService.currentUser$.subscribe((userData) => {
      if (userData) {
        this.user = { ...userData };
        const rawImg = this.user.image_url || this.user.image;
        if (rawImg) {
          this.user.image_url = this.authService.formatImageUrl(rawImg);
        }
        this.filterMenu();
      }
    });

    const token = localStorage.getItem('admin_token');
    if (token) {
      this.authService.getProfile(token).subscribe({
        next: () => {
          this.filterMenu();
        },
        error: (err) => {
          console.error('Error fetching profile:', err);
        },
      });
    }

    this.dashboardService.getRefreshObservable().subscribe(() => {
      this.loadCounts();
    });
  }

  onImageError(event: any) {
    if (event?.target) {
      event.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
    }
  }

  filterMenu(): void {
    if (!this.user) {
      this.menu = [...this.allMenu];
      return;
    }

    if (isSuperAdmin(this.user)) {
      this.menu = [...this.allMenu];
      return;
    }

    const allowedPerms = getUserPermissions(this.user);

    this.menu = this.allMenu.filter((item) => {
      if (!item.perm) return true;
      const permKey = item.perm.toLowerCase();

      return (
        allowedPerms.has(permKey) ||
        allowedPerms.has(item.name.toLowerCase()) ||
        (permKey === 'verification' && (allowedPerms.has('verifycation') || allowedPerms.has('verification'))) ||
        (permKey === 'notifications' && (allowedPerms.has('messages') || allowedPerms.has('send_notifications') || allowedPerms.has('notifications'))) ||
        (permKey === 'top30' && (allowedPerms.has('top30') || allowedPerms.has('top 30'))) ||
        (permKey === 'reports' && (allowedPerms.has('reports') || allowedPerms.has('reports_comments') || allowedPerms.has('comment_reports') || allowedPerms.has('post_reports') || allowedPerms.has('بلاغات'))) ||
        (permKey === 'support' && (allowedPerms.has('support') || allowedPerms.has('support_departments') || allowedPerms.has('support_chats') || allowedPerms.has('الدعم')))
      );
    });
  }

  loadCounts(): void {
    this.dashboardService.getAll().subscribe({
      next: (res) => {
        if (res && res.errorcode === '0' && res.data) {
          this.updateBadges(res.data);
        }
      },
      error: (err) => {
        console.error('Error fetching dashboard counts for sidebar:', err);
      }
    });
  }

  updateBadges(data: any): void {
    this.menu.forEach((item) => {
      if (item.name === 'Deals') {
        item.badgeCount = data.pending_deals;
      }
      if (item.children) {
        item.children.forEach((child: any) => {
          if (child.name === 'Verify Creator') {
            child.badgeCount = data.pending_creators;
          }
          if (child.name === 'Paid Verification Requests') {
            child.badgeCount = data.pending_verification_requests;
          }
          if (child.name === 'Deals List') {
            child.badgeCount = data.pending_deals;
          }
        });
      }
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