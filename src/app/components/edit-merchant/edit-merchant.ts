import { TranslateModule } from '@ngx-translate/core';
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
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
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
  logoName: string = '';
  registerName: string = '';

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
      is_private: [0, Validators.required],
      sign_in_type: ['email'],
      is_active: ['1', Validators.required],
      account_type: ['merchant', Validators.required],
      interests: [[]],
      Store_logo: [null],
      commercial_register: [null],
      status: [1, Validators.required],
    });
  }

  loadCountries() {
    this.usersService.getCountries('en').subscribe({
      next: (res) => (this.countries = res.data || []),
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

  loadInterests() {
    this.interestsService.getInterests('en').subscribe({
      next: (res) => {
        this.interestsList = res?.data?.data || res?.data || [];
      },
      error: () => this.notification.error('Failed to load interests'),
    });
  }

  loadMerchantData() {
    this.loading = true;
    this.merchantService.show(this.merchantId).subscribe({
      next: (res) => {
        this.loading = false;
        const merchant = res.data;
        if (!merchant) {
          this.notification.error('Merchant not found');
          return;
        }
        
        this.oldStoreLogo = merchant.image_url;
        this.oldCommercialRegister = merchant.commercial_register_url;

        this.onCountryChange({ target: { value: merchant.country_id } });
        
        this.merchantForm.patchValue({
          ...merchant,
          interests: merchant.interests?.map((i: any) => i.id) || [],
          account_type: merchant.type || 'merchant',
          status: merchant.status ?? 1,
          is_active: merchant.status?.toString() || '1'
        });
      },
      error: () => {
        this.loading = false;
        this.notification.error('Failed to load merchant data');
      },
    });
  }

  toggleInterest(interestId: number) {
    const selected = [...(this.merchantForm.value.interests || [])];
    const index = selected.indexOf(interestId);
    if (index >= 0) {
      selected.splice(index, 1);
    } else {
      selected.push(interestId);
    }
    this.merchantForm.patchValue({ interests: selected });
  }

  onFileChange(event: any, type: 'Store_logo' | 'commercial_register') {
    const file = event.target.files[0];
    if (file) {
      if (type === 'Store_logo') {
        this.storeLogo = file;
        this.logoName = file.name;
      }
      if (type === 'commercial_register') {
        this.commercialRegister = file;
        this.registerName = file.name;
      }
    }
  }

  onSubmit() {
    if (this.merchantForm.invalid) {
      this.notification.error('Please fill all required fields');
      return;
    }

    const formValue = { ...this.merchantForm.value };
    formValue.id = this.merchantId;
    formValue.gender = +formValue.gender;
    formValue.is_active = +formValue.is_active;
    formValue.status = +formValue.status;

    const formData = new FormData();
    Object.entries(formValue).forEach(([key, value]) => {
      if (key === 'interests') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value as any);
      }
    });

    if (this.storeLogo) {
      formData.append('Store_logo', this.storeLogo);
    }
    if (this.commercialRegister) {
      formData.append('commercial_register', this.commercialRegister);
    }

    this.loading = true;
    this.merchantService.update(formData).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.errorcode === '0') {
          this.notification.success('Merchant updated successfully');
          this.router.navigate(['/admin/merchants']);
        } else {
          this.notification.error(res.message || 'Update failed');
        }
      },
      error: (err) => {
        this.loading = false;
        this.notification.error(
          err.error?.message || 'Failed to update merchant'
        );
      },
    });
  }
}