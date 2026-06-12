import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../../services/users.service';
import { NotificationService } from '../../../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './adduser.html',
  styleUrls: ['./adduser.css'],
})
export class AddUser implements OnInit {
  userForm: FormGroup;
  countries: any[] = [];
  cities: any[] = [];
  loading = false;
  selectedImage: File | null = null;
  userImageName: string = '';

  interestsList = [
    { id: 1, name: 'Education' },
    { id: 2, name: 'Entertainment' },
    { id: 3, name: 'Culture' },
    { id: 4, name: 'Technology' },
    { id: 5, name: 'Sports' },
    { id: 6, name: 'Shopping' },
  ];

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private notification: NotificationService,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      birth_date: ['', Validators.required],
      gender: ['', Validators.required],
      country_id: ['', Validators.required],
      city_id: ['', Validators.required],
      type: ['', Validators.required],
      is_active: ['1', Validators.required],
      interests: [[]],
      image: [null],
    });
  }

  ngOnInit() {
    this.loadCountries();
  }

  loadCountries() {
    this.usersService.getCountries('en').subscribe({
      next: (res) => (this.countries = res.data || res),
      error: () => this.notification.error('Failed to load countries'),
    });
  }

  onCountryChange(event: any) {
    const countryId = event.target.value;
    this.cities = [];
    if (countryId) {
      this.usersService.getCities(countryId, 'en').subscribe({
        next: (res) => (this.cities = res.data || []),
        error: () => this.notification.error('Failed to load cities'),
      });
    }
  }

  toggleInterest(interestId: number) {
    const selected = [...this.userForm.value.interests];
    const index = selected.indexOf(interestId);
    if (index >= 0) {
      selected.splice(index, 1);
    } else {
      selected.push(interestId);
    }
    this.userForm.patchValue({ interests: selected });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      this.userImageName = file.name;
    }
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.notification.error('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    const values = this.userForm.value;

    Object.entries(values).forEach(([key, value]) => {
      if (key === 'interests') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value as any);
      }
    });

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    this.loading = true;
    this.usersService.addUser(formData).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.errorcode === '0') {
          this.notification.success('User added successfully');
          this.router.navigate(['/admin/users']);
          this.userForm.reset();
          this.selectedImage = null;
          this.userImageName = '';
        } else {
          this.notification.error(res.message || 'Failed to add user');
        }
      },
      error: (err) => {
        this.loading = false;
        this.notification.error('Failed to add user, please try again.');
      },
    });
  }
}