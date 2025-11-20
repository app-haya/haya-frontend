import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  form = { email: '', password: '' };

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  onSubmit() {
  this.authService.login(this.form.email, this.form.password).subscribe({
    next: (res: any) => {
      if (res.data?.token) {
        // حفظ التوكن
        localStorage.setItem('admin_token', res.data.token);
        // حفظ بيانات المستخدم كاملة (بما فيها roles و is_super_admin)
        localStorage.setItem('admin_user', JSON.stringify(res.data.admin));

        this.notificationService.success('Login successful!');
        this.router.navigate(['/dashboard']); // إعادة توجيه بعد حفظ البيانات
      }
    },
    error: (err: any) => {
      if (err.error?.message) {
        this.notificationService.error(err.error.message);
      } else {
        this.notificationService.error('Login failed!');
      }
    }
  });
}
}
