import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notification.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './admin-profile.html',
  styleUrls: ['./admin-profile.css'],
})
export class AdminProfile implements OnInit {
  adminId!: number;
  admin: any = {
    name: '',
    email: '',
    phone: '',
    is_super_admin: false,
    roles: [],
    image_url: '',
    password: '',
  };
  imageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  showPassword = false;
  loading = false;

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    const userStr = localStorage.getItem('admin_user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    if (currentUser && currentUser.id) {
      this.adminId = currentUser.id;
      this.fetchAdminData();
    }
  }

  fetchAdminData(): void {
    this.loading = true;
    this.adminService.showAdmin(this.adminId).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res?.data) {
          const adminData = res.data;
          let formattedImageUrl = adminData.image_url || '';
          if (!formattedImageUrl && adminData.image) {
            formattedImageUrl = adminData.image.startsWith('http')
              ? adminData.image
              : environment.apiUrl.replace('/api', '') + '/admin_images/' + adminData.image;
          }

          this.admin = {
            ...this.admin,
            ...adminData,
            image_url: formattedImageUrl,
            is_super_admin:
              adminData.is_super_admin === 1 ||
              adminData.is_super_admin === true ||
              adminData.is_super_admin === '1',
          };
        }
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.error('Failed to load profile data');
        console.error(err);
      },
    });
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.imageFile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      if (this.imageFile) {
        reader.readAsDataURL(this.imageFile);
      }
    }
  }

  formatRoleName(name: any): string {
    const roleStr = typeof name === 'object' && name ? name.name : String(name || '');
    if (!roleStr) return '—';
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
    return map[roleStr.toLowerCase()] || roleStr;
  }

  saveProfile(): void {
    if (this.loading) return;
    this.loading = true;

    const formData = new FormData();
    formData.append('id', this.adminId.toString());
    formData.append('name', this.admin.name ?? '');
    formData.append('email', this.admin.email ?? '');
    formData.append('phone', this.admin.phone ?? '');

    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }
    if (this.admin.password) {
      formData.append('password', this.admin.password);
    }

    this.adminService.updateAdmin(formData).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res?.errorcode === '0') {
          const updatedAdmin = res.data || {};
          let newImgUrl = updatedAdmin.image_url || this.admin.image_url;
          if (!newImgUrl && updatedAdmin.image) {
            newImgUrl = updatedAdmin.image.startsWith('http')
              ? updatedAdmin.image
              : environment.apiUrl.replace('/api', '') + '/admin_images/' + updatedAdmin.image;
          }

          const userStr = localStorage.getItem('admin_user');
          if (userStr) {
            try {
              const u = JSON.parse(userStr);
              u.name = this.admin.name;
              u.email = this.admin.email;
              u.phone = this.admin.phone;
              if (newImgUrl) u.image_url = newImgUrl;
              if (updatedAdmin.image) u.image = updatedAdmin.image;
              localStorage.setItem('admin_user', JSON.stringify(u));
            } catch (e) {}
          }

          this.notificationService.success('Profile updated successfully!');
          this.admin.password = '';
          this.fetchAdminData();
        } else {
          this.notificationService.error(res.message || 'Failed to update profile');
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 422 && err.error?.message) {
          this.notificationService.error(err.error.message);
        } else {
          this.notificationService.error('Failed to update profile');
        }
        console.error(err);
      },
    });
  }
}
