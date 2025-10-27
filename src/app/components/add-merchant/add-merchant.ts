import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MerchantService } from '../../services/merchant.service';
import { UsersService } from '../../services/users.service';
import { InterestsService } from '../../services/interests.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-merchant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-merchant.html',
  styleUrls: ['./add-merchant.css'],
})
export class AddMerchant implements OnInit {
  merchantForm: FormGroup;
  countries: any[] = [];
  cities: any[] = [];
  interestsList: any[] = [];
  loading = false;

  storeLogo: File | null = null;
  commercialRegister: File | null = null;

  constructor(
    private fb: FormBuilder,
    private merchantService: MerchantService,
    private usersService: UsersService,
    private interestsService: InterestsService,
    private notification: NotificationService,
    private router: Router
  ) {
    this.merchantForm = this.fb.group({
      name: ['', Validators.required],
      owner_name: ['', Validators.required],
      id_num: ['', Validators.required],
      expiration_date: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      activity: ['', Validators.required],
      phone: ['', Validators.required],
      country_id: ['', Validators.required],
      city_id: ['', Validators.required],
      birth_date: ['', Validators.required],
      gender: ['1'],
      privacy: ['public'],
      sign_in_type: ['email'],
      is_active: ['1', Validators.required],
      account_type: ['merchant', Validators.required],
      interests: [[]],
      Store_logo: [null],
      commercial_register: [null],
    });
  }

  ngOnInit(): void {
    this.loadCountries();
    this.loadInterests();
  }

  // 🗺 تحميل الدول
  loadCountries() {
    this.usersService.getCountries('en').subscribe({
      next: (res) => (this.countries = res.data || []),
      error: () => this.notification.error('❌ Failed to load countries'),
    });
  }

  // 🏙 تحميل المدن عند اختيار الدولة
  onCountryChange(event: any) {
    const countryId = event.target.value;
    this.cities = [];
    if (countryId) {
      this.usersService.getCities(countryId, 'en').subscribe({
        next: (res) => (this.cities = res.data || []),
        error: () => this.notification.error('❌ Failed to load cities'),
      });
    }
  }

  // ❤️ تحميل الاهتمامات
  loadInterests() {
    this.interestsService.getInterests('en').subscribe({
      next: (res) => {
        this.interestsList = res?.data?.data || res?.data || [];
      },
      error: () => this.notification.error('❌ Failed to load interests'),
    });
  }

  // ✅ اختيار الاهتمامات
  onInterestChange(event: any) {
    const selected = this.merchantForm.value.interests as number[];
    const interestId = parseInt(event.target.value);
    if (event.target.checked) {
      if (!selected.includes(interestId)) selected.push(interestId);
    } else {
      const index = selected.indexOf(interestId);
      if (index >= 0) selected.splice(index, 1);
    }
    this.merchantForm.patchValue({ interests: selected });
  }

  // 📷 تحميل الصور
  onFileChange(event: any, type: 'Store_logo' | 'commercial_register') {
    const file = event.target.files[0];
    if (file) {
      if (type === 'Store_logo') this.storeLogo = file;
      if (type === 'commercial_register') this.commercialRegister = file;
    }
  }

  // 💾 إرسال البيانات
  onSubmit() {
    if (this.merchantForm.invalid) {
      this.notification.error('Please fill all required fields');
      return;
    }

    // ✅ نخلي country_id يروح كـ string بدون أي تحويل
    const formValue = this.merchantForm.value;
    formValue.gender = +formValue.gender;
    formValue.is_active = +formValue.is_active;

    console.log('Final form (country_id as string):', formValue);

    // 🧾 بناء FormData
    const formData = new FormData();
    Object.entries(formValue).forEach(([key, value]) => {
      if (key === 'interests') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value as any);
      }
    });

    if (this.storeLogo) formData.append('Store_logo', this.storeLogo);
    if (this.commercialRegister)
      formData.append('commercial_register', this.commercialRegister);

    this.loading = true;

    this.merchantService.add(formData).subscribe({
      next: (res) => {
        let message = res?.message || 'Merchant added successfully!';
        try {
          message = JSON.parse(`"${message}"`);
        } catch {}
        if (res.errorcode === '0') {
          this.notification.success('Merchant added successfully');
          this.router.navigate(['/merchants']);

          console.table(res.data);
          this.merchantForm.reset();
        } else {
          this.notification.error(message);
        }
        this.loading = false;
      },
      error: (err) => {
        const message = err.error?.message || ' Failed to add merchant';
        this.notification.error(message);
        this.loading = false;
      },
    });
  }
}
