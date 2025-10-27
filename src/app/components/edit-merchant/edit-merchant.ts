import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MerchantService } from '../../services/merchant.service';
import { UsersService } from '../../services/users.service';
import { InterestsService } from '../../services/interests.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-edit-merchant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-merchant.html',
  styleUrls: ['./edit-merchant.css'],
})
export class EditMerchant implements OnInit {
  merchantForm!: FormGroup;
  merchantId!: number;
  countries: any[] = [];
  cities: any[] = [];
  interestsList: any[] = [];
  loading = false;
  oldStoreLogo: string | null = null;
  oldCommercialRegister: string | null = null;

  storeLogo: File | null = null;
  commercialRegister: File | null = null;

  constructor(
    private fb: FormBuilder,
    private merchantService: MerchantService,
    private usersService: UsersService,
    private interestsService: InterestsService,
    private notification: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.merchantId = +this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.loadCountries();
    this.loadInterests();
    this.loadMerchantData();
  }

  initForm() {
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
is_private: [0, Validators.required] ,     sign_in_type: ['email'],
      is_active: ['1', Validators.required],
      account_type: ['merchant', Validators.required],
      interests: [[]],
      Store_logo: [null],
      commercial_register: [null],
      status: [1, Validators.required], // 👈 status رقمي (0 أو 1)
    });
  }

  loadCountries() {
    this.usersService.getCountries('en').subscribe({
      next: (res) => (this.countries = res.data || []),
      error: () => this.notification.error('❌ Failed to load countries'),
    });
  }

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

  loadInterests() {
    this.interestsService.getInterests('en').subscribe({
      next: (res) => {
        this.interestsList = res?.data?.data || res?.data || [];
      },
      error: () => this.notification.error('❌ Failed to load interests'),
    });
  }

  loadMerchantData() {
    this.merchantService.show(this.merchantId).subscribe({
      next: (res) => {
        const merchant = res.data;
        if (!merchant) {
          this.notification.error('Merchant not found');
          return;
        }

        // تحميل المدن الخاصة بالدولة المختارة
        this.onCountryChange({ target: { value: merchant.country_id } });

        this.merchantForm.patchValue({
          ...merchant,
          interests: merchant.interests?.map((i: any) => i.id) || [],
          account_type: merchant.type || 'merchant',
          status: merchant.status ?? 1, // تأكيد وجود status من البيانات
        });
      },
      error: () => {
        this.notification.error('Failed to load merchant data');
      },
    });
  }

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

  onFileChange(event: any, type: 'Store_logo' | 'commercial_register') {
    const file = event.target.files[0];
    if (file) {
      if (type === 'Store_logo') this.storeLogo = file;
      if (type === 'commercial_register') this.commercialRegister = file;
    }
  }

  onSubmit() {
    if (this.merchantForm.invalid) {
      this.notification.error('Please fill all required fields');
      return;
    }

    const formValue = this.merchantForm.value;
    formValue.id = this.merchantId;
    formValue.gender = +formValue.gender;
    formValue.is_active = +formValue.is_active;
    formValue.status = +formValue.status; // 👈 تحويل status إلى رقم دائمًا

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
    this.merchantService.update(formData).subscribe({
      next: (res) => {
        if (res.errorcode === '0') {
          this.notification.success('Merchant updated successfully');
          this.router.navigate(['/merchants']);
        } else {
          this.notification.error(res.message || 'Update failed');
        }
        this.loading = false;
      },
      error: (err) => {
        const message = err.error?.message || ' Failed to update merchant';
        this.notification.error(message);
        this.loading = false;
      },
    });
  }
}
