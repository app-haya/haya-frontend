import { Component, Output, EventEmitter, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit {
  @Output() darkModeChange = new EventEmitter<boolean>();
  @Output() sidebarToggle = new EventEmitter<void>();
  showLangDropdown = false;
  showUserDropdown = false;
  showNotifDropdown = false;
  isDarkMode = false;
  adminUser: any = null;

  notificationsList: any[] = [];
  unreadCount = 0;
  loadingNotifs = false;
  readNotifIds: string[] = [];

  constructor(
    public translate: TranslateService,
    private theme: ThemeService,
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router,
    private eRef: ElementRef
  ) {}

  ngOnInit() {
    this.isDarkMode = this.theme.isDark();
    this.loadAdminUser();
    this.loadReadNotifIds();
    this.fetchSystemNotifications();
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showLangDropdown = false;
      this.showUserDropdown = false;
      this.showNotifDropdown = false;
    }
  }

  loadReadNotifIds() {
    const saved = localStorage.getItem('admin_read_notif_ids');
    if (saved) {
      try {
        this.readNotifIds = JSON.parse(saved);
      } catch (e) {
        this.readNotifIds = [];
      }
    }
  }

  saveReadNotifIds() {
    localStorage.setItem('admin_read_notif_ids', JSON.stringify(this.readNotifIds));
  }

  loadAdminUser() {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.adminUser = { ...user };
        const rawImg = this.adminUser.image_url || this.adminUser.image;
        if (rawImg) {
          this.adminUser.image_url = this.authService.formatImageUrl(rawImg);
        }
      } else {
        this.adminUser = null;
      }
    });
  }

  onImageError(event: any) {
    if (event?.target) {
      event.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
    }
  }

  fetchSystemNotifications() {
    this.loadingNotifs = true;
    this.adminService.getSystemNotifications().subscribe({
      next: (res: any) => {
        this.loadingNotifs = false;
        if (res?.data && Array.isArray(res.data)) {
          this.notificationsList = res.data.map((n: any) => ({
            ...n,
            isRead: this.readNotifIds.includes(n.id)
          }));
          this.unreadCount = this.notificationsList.filter(n => !n.isRead).length;
        }
      },
      error: (err) => {
        this.loadingNotifs = false;
        console.error('Failed to load system notifications:', err);
      }
    });
  }

  toggleNotifDropdown(event?: Event) {
    if (event) event.stopPropagation();
    this.showNotifDropdown = !this.showNotifDropdown;
    this.showLangDropdown = false;
    this.showUserDropdown = false;
    if (this.showNotifDropdown) {
      this.fetchSystemNotifications();
    }
  }

  toggleUserDropdown(event?: Event) {
    if (event) event.stopPropagation();
    this.showUserDropdown = !this.showUserDropdown;
    this.showLangDropdown = false;
    this.showNotifDropdown = false;
  }

  toggleDropdown(event?: Event) {
    if (event) event.stopPropagation();
    this.showLangDropdown = !this.showLangDropdown;
    this.showUserDropdown = false;
    this.showNotifDropdown = false;
  }

  markAllAsRead() {
    this.notificationsList.forEach(n => {
      n.isRead = true;
      if (!this.readNotifIds.includes(n.id)) {
        this.readNotifIds.push(n.id);
      }
    });
    this.unreadCount = 0;
    this.saveReadNotifIds();
  }

  onNotificationClick(notif: any) {
    notif.isRead = true;
    if (!this.readNotifIds.includes(notif.id)) {
      this.readNotifIds.push(notif.id);
      this.saveReadNotifIds();
    }
    this.unreadCount = this.notificationsList.filter(n => !n.isRead).length;
    this.showNotifDropdown = false;
    if (notif.link) {
      this.router.navigate([notif.link]);
    }
  }

  goToProfile() {
    this.showUserDropdown = false;
    this.router.navigate(['/admin/profile']);
  }

  openProfile() {
    this.router.navigate(['/admin/profile']);
  }

  logout() {
    this.showUserDropdown = false;
    const token = localStorage.getItem('admin_token');
    if (!token) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      this.router.navigateByUrl('/login').then(() => {
        window.location.reload();
      });
      return;
    }
    this.authService.logout(token).subscribe({
      next: () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        this.router.navigateByUrl('/login').then(() => {
          window.location.reload();
        });
      },
      error: () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        this.router.navigateByUrl('/login').then(() => {
          window.location.reload();
        });
      },
    });
  }

  changeLang(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    document.body.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    const bsLink = document.getElementById('bootstrap-css') as HTMLLinkElement;
    if (bsLink) {
      bsLink.href = lang === 'ar'
        ? 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css'
        : 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
    }
    this.showLangDropdown = false;
    this.fetchSystemNotifications();
  }

  toggleDarkMode() {
    this.theme.toggle();
    this.isDarkMode = this.theme.isDark();
    this.darkModeChange.emit(this.isDarkMode);
  }

  toggleSidebar() {
    this.sidebarToggle.emit();
  }
}