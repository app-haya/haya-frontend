import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationSendService } from '../../services/notification-send.service';
import { UsersService } from '../../services/users.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-send-notifications',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './send-notifications.html',
  styleUrls: ['./send-notifications.css'],
})
export class SendNotifications implements OnInit {
  notificationForm: FormGroup;
  countries: any[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private notificationSendService: NotificationSendService,
    private usersService: UsersService,
    private notification: NotificationService
  ) {
    this.notificationForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      body: ['', [Validators.required, Validators.maxLength(1000)]],
      user_type: ['all', Validators.required],
      verification_status: ['all', Validators.required],
      country_id: [''],
    });
  }

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries() {
    this.usersService.getCountries('en').subscribe({
      next: (res) => (this.countries = res.data || []),
      error: () => this.notification.error('Failed to load countries'),
    });
  }

  onSubmit() {
    if (this.notificationForm.invalid) {
      this.notification.error('Please fill all required fields');
      return;
    }

    const formValue = { ...this.notificationForm.value };
    if (!formValue.country_id) {
      formValue.country_id = null;
    } else {
      formValue.country_id = Number(formValue.country_id);
    }

    this.loading = true;
    this.notificationSendService.send(formValue).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.errorcode === '0') {
          this.notification.success('Notifications queued and sent successfully');
          this.notificationForm.reset({
            title: '',
            body: '',
            user_type: 'all',
            verification_status: 'all',
            country_id: '',
          });
        } else {
          this.notification.error(res.message || 'Failed to send notifications');
        }
      },
      error: (err) => {
        this.loading = false;
        this.notification.error(
          err.error?.message || 'Failed to send notifications'
        );
      },
    });
  }
}
