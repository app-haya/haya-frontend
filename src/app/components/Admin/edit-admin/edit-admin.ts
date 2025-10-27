import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-admin.html',
  styleUrls: ['./edit-admin.css'],
})
export class EditAdmin implements OnInit {
  @Input() adminId!: number;
  admin: any = {
    name: '',
    email: '',
    type: 0,
    phone: '',
    image_url: '',
  };
  imageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.adminId = +params['id'];
      if (this.adminId) {
        this.fetchAdminData();
      }
    });
  }

  fetchAdminData() {
    this.adminService.showAdmin(this.adminId).subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.admin = { ...this.admin, ...res.data };
        }
      },
      error: (err) => {
        this.notificationService.error(' Failed to load admin data');
        console.error(err);
      },
    });
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.imageFile = event.target.files[0];
    }
  }

  updateAdmin() {
    const formData = new FormData();
    formData.append('id', this.adminId.toString());
    formData.append('name', this.admin.name ?? '');
    formData.append('email', this.admin.email ?? '');
    formData.append('type', this.admin.type?.toString() ?? '0');
    formData.append('phone', this.admin.phone ?? '');

    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }
    if (this.admin.password) {
      formData.append('password', this.admin.password);
    }

    this.adminService.updateAdmin(formData).subscribe({
      next: (res: any) => {
        if (res?.errorcode === '0') {
          this.notificationService.success(' Admin updated successfully!');
          this.router.navigate(['/admins']);
        } else {
          this.notificationService.error(` ${res.message}`);
        }
      },
      error: (err) => {
        if (err.status === 422 && err.error?.message) {
          this.notificationService.error(` ${err.error.message}`);
        } else {
          this.notificationService.error(' Failed to update admin');
        }
        console.error(err);
      },
    });
  }
}
