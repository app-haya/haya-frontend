import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './edit-admin.html',
  styleUrls: ['./edit-admin.css'],
})
export class EditAdmin implements OnInit {
  adminId!: number;
  admin: any = {
    name: '',
    email: '',
    type: 0,
    phone: '',
    is_super_admin: false,
    roles: [],
    image_url: '',
    password: '',
  };
  roles: any[] = [];
  imageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  adminImageName: string = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.route.params.subscribe((params) => {
      this.adminId = +params['id'];
      if (this.adminId) this.fetchAdminData();
    });
  }

  loadRoles() {
    this.adminService.getRoles().subscribe({
      next: (res: any) => {
        if (res.errorcode === '0') this.roles = res.data;
      },
    });
  }

  fetchAdminData() {
    this.loading = true;
    this.adminService.showAdmin(this.adminId).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res?.data) {
          this.admin = { ...this.admin, ...res.data };
          // Ensure is_super_admin is a boolean
          this.admin.is_super_admin =
            this.admin.is_super_admin === 1 || this.admin.is_super_admin === true;
        }
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.error('Failed to load admin data');
        console.error(err);
      },
    });
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.imageFile = event.target.files[0];
      this.adminImageName = this.imageFile?.name || '';
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      if (this.imageFile) {
        reader.readAsDataURL(this.imageFile);
      }
    }
  }

  toggleRole(roleId: number, checked: boolean) {
    if (!this.admin.roles) this.admin.roles = [];
    if (checked) {
      if (!this.admin.roles.includes(roleId)) {
        this.admin.roles.push(roleId);
      }
    } else {
      this.admin.roles = this.admin.roles.filter((id: number) => id !== roleId);
    }
  }

  toggleRoleTag(roleId: number) {
    if (!this.admin.roles) this.admin.roles = [];
    const index = this.admin.roles.indexOf(roleId);
    if (index >= 0) {
      this.admin.roles.splice(index, 1);
    } else {
      this.admin.roles.push(roleId);
    }
  }

  toggleSuperAdmin(checked: boolean) {
    this.admin.is_super_admin = checked;
    if (checked) this.admin.roles = [];
  }

  updateAdmin() {
    if (this.loading) return;
    this.loading = true;

    const formData = new FormData();
    formData.append('id', this.adminId.toString());
    formData.append('name', this.admin.name ?? '');
    formData.append('email', this.admin.email ?? '');
    formData.append('phone', this.admin.phone ?? '');
    formData.append('is_super_admin', this.admin.is_super_admin ? '1' : '0');

    if (!this.admin.is_super_admin && Array.isArray(this.admin.roles)) {
      this.admin.roles.forEach((id: number, index: number) => {
        formData.append(`roles[${index}]`, id.toString());
      });
    }

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
          this.notificationService.success('Admin updated successfully!');
          this.router.navigate(['/admin/admins']);
        } else {
          this.notificationService.error(
            res.message || 'Failed to update admin'
          );
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 422 && err.error?.message) {
          this.notificationService.error(err.error.message);
        } else {
          this.notificationService.error('Failed to update admin');
        }
        console.error(err);
      },
    });
  }
}