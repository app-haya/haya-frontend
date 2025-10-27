import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../services/admin.service';
import { NotificationService } from '../../../../services/notification.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-add-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-admin.html',
  styleUrls: ['./add-admin.css']
})
export class AddAdmin {
  admin = {
    name: '',
    email: '',
    password: '',
    type: 0,
    phone: ''
  };
  imageFile: File | null = null;

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.imageFile = event.target.files[0];
    }
  }

  addAdmin() {
    const formData = new FormData();
    formData.append('name', this.admin.name);
    formData.append('email', this.admin.email);
    formData.append('password', this.admin.password);
    formData.append('type', this.admin.type.toString());
    formData.append('phone', this.admin.phone);
    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    this.adminService.addAdmin(formData).subscribe({
      next: (res: any) => {
        if (res?.errorcode === '0') {
          this.notificationService.success(' Admin added successfully!');
          this.router.navigate(['/admins']);
          this.admin = { name: '', email: '', password: '', type: 0, phone: '' };
          this.imageFile = null;
        } else {
          this.notificationService.error(` ${res.message}`);
        }
      },
      error: (err) => {
        if (err.status === 422) {
          this.notificationService.error(` ${err.error.message}`);
        } else {
          this.notificationService.error(' Error adding admin');
        }
        console.error('Error adding admin:', err);
      }
    });
  }
}
