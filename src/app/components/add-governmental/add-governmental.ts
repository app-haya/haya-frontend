import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GovernmentalService } from '../../services/governmental.service';
import { UsersService } from '../../services/users.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { InterestsService } from '../../services/interests.service';

@Component({
  selector: 'app-add-governmental',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-governmental.html',
  styleUrls: ['./add-governmental.css'],
})
export class AddGovernmental implements OnInit {
  governmentalForm: FormGroup;
  countries: any[] = [];
  cities: any[] = [];
  interestsList: any[] = [];
  selectedInterests: number[] = [];
  loading = false;

  storeLogo: File | null = null;
  commercialRegister: File | null = null;

  constructor(
    private fb: FormBuilder,
    private governmentalService: GovernmentalService,
    private usersService: UsersService,
    private interestsService: InterestsService,

    private notification: NotificationService,
    private router: Router
  ) {
    this.governmentalForm = this.fb.group({
      name: ['', Validators.required],
      owner_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      activity: ['', Validators.required],
      country_id: ['', Validators.required],
      city_id: ['', Validators.required],
      sign_in_type: ['email'],
      is_active: ['1', Validators.required],
      account_type: ['governmental', Validators.required],
      Store_logo: [null],
      commercial_register: [null],
      id_num: [''],
      birth_date: [''],
      expiration_date: [''],
    });
  }

  ngOnInit(): void {
    this.loadCountries();
    this.loadInterests();
  }

  loadCountries() {
    this.usersService.getCountries('en').subscribe({
      next: (res) => (this.countries = res.data || []),
      error: () => this.notification.error(' Failed to load countries'),
    });
  }

  loadInterests() {
    this.interestsService.getInterests('en').subscribe({
      next: (res) => {
        this.interestsList = res?.data?.data || res?.data || [];
      },
      error: () => this.notification.error(' Failed to load interests'),
    });
  }

  onCountryChange(event: any) {
    const countryId = event.target.value;
    this.cities = [];
    if (countryId) {
      this.usersService.getCities(countryId, 'en').subscribe({
        next: (res) => (this.cities = res.data || []),
        error: () => this.notification.error(' Failed to load cities'),
      });
    }
  }

  onFileChange(event: any, type: 'Store_logo' | 'commercial_register') {
    const file = event.target.files[0];
    if (file) {
      if (type === 'Store_logo') this.storeLogo = file;
      if (type === 'commercial_register') this.commercialRegister = file;
    }
  }

  onInterestChange(event: any) {
    const interestId = +event.target.value;
    if (event.target.checked) {
      this.selectedInterests.push(interestId);
    } else {
      this.selectedInterests = this.selectedInterests.filter(
        (id) => id !== interestId
      );
    }
  }

  onSubmit() {
    if (this.governmentalForm.invalid) {
      this.notification.error('Please fill all required fields');
      return;
    }

    const formValue = this.governmentalForm.value;
    formValue.is_active = +formValue.is_active;

    const formData = new FormData();
    Object.entries(formValue).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value as any);
      }
    });

    if (this.storeLogo) formData.append('Store_logo', this.storeLogo);
    if (this.commercialRegister)
      formData.append('commercial_register', this.commercialRegister);

    // 🟢 Add selected interests
    this.selectedInterests.forEach((id, index) => {
      formData.append('interests', JSON.stringify(this.selectedInterests));
    });

    this.loading = true;

    this.governmentalService.add(formData).subscribe({
      next: (res) => {
        let message = res?.message || 'Governmental added successfully!';
        if (res.errorcode === '0') {
          this.notification.success('Governmental added successfully');
          this.router.navigate(['/governments']);
          this.governmentalForm.reset();
        } else {
          this.notification.error(message);
        }
        this.loading = false;
      },
      error: (err) => {
        const message = err.error?.message || ' Failed to add governmental';
        this.notification.error(message);
        this.loading = false;
      },
    });
  }
}
