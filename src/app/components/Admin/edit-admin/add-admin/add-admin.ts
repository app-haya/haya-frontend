import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../services/admin.service';
import { NotificationService } from '../../../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './add-admin.html',
  styleUrls: ['./add-admin.css'],
})
export class AddAdmin implements OnInit {
  roles: any[] = [];
  admin = {
    name: '',
    email: '',
    password: '',
    phone: '',
    is_super_admin: false,
    roles: [] as number[],
  };
  imageFile: File | null = null;
  adminImageName: string = '';
  loading = false;

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles() {
    this.adminService.getRoles().subscribe({
      next: (res: any) => {
        if (res.errorcode === '0') {
          this.roles = res.data;
        }
      },
    });
  }

  formatRoleName(name: string): string {
    if (!name) return '—';
    const map: { [key: string]: string } = {
      'verifycation': 'التوثيق والأسعار',
      'verification': 'التوثيق والأسعار',
      'users': 'المستخدمين',
      'merchants': 'التجار',
      'governments': 'الجهات الحكومية',
      'top30': 'إدارة توب 30',
      'deals': 'الصفقات وطلبات الشراء',
      'messages': 'إرسال الإشعارات والرسائل',
      'notifications': 'إرسال الإشعارات والرسائل',
      'settings': 'الإعدادات والسياسات',
      'loyalty': 'إدارة الولاء والعملات',
      'wallet': 'المحفظة المالية',
      'interests': 'الاهتمامات',
      'cities': 'المدن',
      'countries': 'الدول',
      'banned_words': 'الكلمات المحظورة',
      'calendar': 'التقويم والفعاليات',
      'dashboard': 'لوحة التحكم',
      'admins': 'المديرين والصلاحيات'
    };
    return map[name.toLowerCase()] || name;
  }

  toggleRole(roleId: number, checked: boolean) {
    if (checked) {
      if (!this.admin.roles.includes(roleId)) {
        this.admin.roles.push(roleId);
      }
    } else {
      this.admin.roles = this.admin.roles.filter((id) => id !== roleId);
    }
  }

  toggleRoleTag(roleId: number) {
    const index = this.admin.roles.indexOf(roleId);
    if (index >= 0) {
      this.admin.roles.splice(index, 1);
    } else {
      this.admin.roles.push(roleId);
    }
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.imageFile = event.target.files[0];
      this.adminImageName = this.imageFile?.name || '';
    }
  }

  addAdmin() {
    if (this.loading) return;
    this.loading = true;

    const formData = new FormData();
    formData.append('name', this.admin.name);
    formData.append('email', this.admin.email);
    formData.append('password', this.admin.password);
    formData.append('phone', this.admin.phone);
    formData.append('is_super_admin', this.admin.is_super_admin ? '1' : '0');

    if (!this.admin.is_super_admin) {
      this.admin.roles.forEach((id, index) => {
        formData.append(`roles[${index}]`, id.toString());
      });
    }

    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    this.adminService.addAdmin(formData).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res?.errorcode === '0') {
          this.notificationService.success('Admin added successfully!');
          this.router.navigate(['/admin/admins']);
          this.admin = {
            name: '',
            email: '',
            password: '',
            phone: '',
            is_super_admin: false,
            roles: [],
          };
          this.imageFile = null;
          this.adminImageName = '';
        } else {
          this.notificationService.error(res.message);
        }
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.error(
          err.error?.message || 'Error adding admin'
        );
      },
    });
  }

  toggleSuperAdmin(checked: boolean) {
    if (checked) {
      this.admin.roles = [];
    }
  }
}