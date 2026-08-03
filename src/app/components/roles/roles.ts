import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../services/notification.service';
import { AdminService } from '../../services/admin.service';

export interface SystemPermission {
  key: string;
  name_ar: string;
  name_en: string;
  icon: string;
  category: string;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './roles.html',
  styleUrls: ['./roles.css'],
})
export class Roles implements OnInit {
  roles: any[] = [];
  filteredRoles: any[] = [];
  loading = false;
  searchTerm = '';
  showModal = false;
  modalTitle = 'Add Role';
  editingRole: any = null;

  systemPermissions: SystemPermission[] = [
    { key: 'dashboard', name_ar: 'لوحة التحكم', name_en: 'Dashboard', icon: 'bi-house-door', category: 'main' },
    { key: 'admins', name_ar: 'المديرين والصلاحيات', name_en: 'Admins & Roles', icon: 'bi-person-gear', category: 'management' },
    { key: 'users', name_ar: 'المستخدمين', name_en: 'Users', icon: 'bi-people', category: 'users' },
    { key: 'merchants', name_ar: 'التجار', name_en: 'Merchants', icon: 'bi-shop', category: 'users' },
    { key: 'governments', name_ar: 'الجهات الحكومية', name_en: 'Governments', icon: 'bi-bank', category: 'users' },
    { key: 'verification', name_ar: 'التوثيق والأسعار', name_en: 'Verification & Prices', icon: 'bi-bag-check', category: 'features' },
    { key: 'top30', name_ar: 'إدارة توب 30', name_en: 'Top 30 Users', icon: 'bi-trophy', category: 'features' },
    { key: 'loyalty', name_ar: 'إدارة الولاء والعملات', name_en: 'Loyalty Management', icon: 'bi-award', category: 'features' },
    { key: 'deals', name_ar: 'الصفقات وطلبات الشراء', name_en: 'Deals & Orders', icon: 'bi-bag-check', category: 'features' },
    { key: 'interests', name_ar: 'الاهتمامات', name_en: 'Interests', icon: 'bi-star', category: 'system' },
    { key: 'cities', name_ar: 'المدن', name_en: 'Cities', icon: 'bi-geo-alt', category: 'system' },
    { key: 'countries', name_ar: 'الدول', name_en: 'Countries', icon: 'bi-globe', category: 'system' },
    { key: 'banned_words', name_ar: 'الكلمات المحظورة', name_en: 'Banned Words', icon: 'bi-slash-circle', category: 'system' },
    { key: 'wallet', name_ar: 'المحفظة المالية', name_en: 'Wallet', icon: 'bi-wallet2', category: 'finance' },
    { key: 'calendar', name_ar: 'التقويم والفعاليات', name_en: 'Calendar', icon: 'bi-calendar-event', category: 'features' },
    { key: 'notifications', name_ar: 'إرسال الإشعارات', name_en: 'Send Notifications', icon: 'bi-bell', category: 'communication' },
    { key: 'comment_reports', name_ar: 'بلاغات التعليقات', name_en: 'Comment Reports', icon: 'bi-chat-right-quote', category: 'moderation' },
    { key: 'post_reports', name_ar: 'بلاغات المنشورات', name_en: 'Post Reports', icon: 'bi-file-earmark-post', category: 'moderation' },
    { key: 'support', name_ar: 'نظام الدعم الفني والمحادثات', name_en: 'Support System & Chats', icon: 'bi-headset', category: 'communication' },
    { key: 'settings', name_ar: 'الإعدادات والسياسات', name_en: 'Settings', icon: 'bi-gear', category: 'system' },
  ];

  formData: { id: number | null; name: string; permissions: string[] } = {
    id: null,
    name: '',
    permissions: [],
  };

  constructor(
    private rolesService: AdminService,
    private notification: NotificationService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadPermissions();
    this.loadRoles();
  }

  loadPermissions(): void {
    this.rolesService.getPermissions().subscribe({
      next: (res) => {
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          this.systemPermissions = res.data;
        }
      },
      error: (err) => {
        console.log('Using default client system permissions', err);
      }
    });
  }

  loadRoles(): void {
    this.loading = true;
    this.rolesService.getRoles().subscribe({
      next: (res) => {
        this.roles = res?.data || res || [];
        this.filteredRoles = [...this.roles];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading roles:', err);
        this.loading = false;
      },
    });
  }

  filterRoles(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredRoles = [...this.roles];
      return;
    }
    this.filteredRoles = this.roles.filter((role) =>
      (role.name || '').toLowerCase().includes(term)
    );
  }

  openAddModal(): void {
    this.modalTitle = 'Add Role';
    this.showModal = true;
    this.editingRole = null;
    this.formData = { id: null, name: '', permissions: [] };
  }

  openEditModal(role: any): void {
    this.modalTitle = 'Edit Role';
    this.showModal = true;
    this.editingRole = role;
    
    let perms: string[] = [];
    if (Array.isArray(role.permissions)) {
      perms = role.permissions;
    } else if (typeof role.permissions === 'string') {
      try {
        perms = JSON.parse(role.permissions);
      } catch (e) {
        perms = [role.permissions];
      }
    }

    this.formData = {
      id: role.id,
      name: role.name,
      permissions: perms,
    };
  }

  togglePermission(key: string): void {
    const index = this.formData.permissions.indexOf(key);
    if (index > -1) {
      this.formData.permissions.splice(index, 1);
    } else {
      this.formData.permissions.push(key);
    }
  }

  isPermissionSelected(key: string): boolean {
    return this.formData.permissions.includes(key);
  }

  selectAllPermissions(): void {
    this.formData.permissions = this.systemPermissions.map(p => p.key);
  }

  deselectAllPermissions(): void {
    this.formData.permissions = [];
  }

  saveRole(): void {
    if (!this.formData.name.trim()) {
      this.notification.error('Please enter a role name');
      return;
    }

    const payload = {
      name: this.formData.name,
      permissions: this.formData.permissions
    };

    const req$ = this.editingRole
      ? this.rolesService.updateRole(this.formData.id!, payload)
      : this.rolesService.createRole(payload);

    req$.subscribe({
      next: () => {
        this.notification.success('Role saved successfully');
        this.showModal = false;
        this.loadRoles();
      },
      error: () => this.notification.error('Failed to save role'),
    });
  }

  deleteRole(id: number): void {
    if (!confirm('Are you sure you want to delete this role?')) return;
    this.rolesService.deleteRole(id).subscribe({
      next: () => {
        this.notification.success('Role deleted successfully');
        this.roles = this.roles.filter((r) => r.id !== id);
        this.filteredRoles = this.filteredRoles.filter((r) => r.id !== id);
      },
      error: (err) => {
        console.error(err);
        this.notification.error('Failed to delete role');
      },
    });
  }

  getPermissionLabel(perm: SystemPermission): string {
    return this.translate.currentLang === 'ar' ? perm.name_ar : perm.name_en;
  }
}