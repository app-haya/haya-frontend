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

  storeLogoPreview: string | null = null;
  commercialRegisterPreview: string | null = null;

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
      owner_name: [''],
      id_num: [''],
      expiration_date: [''],
      email: ['', Validators.email],
      activity: [''],
      phone: [''],
      country_id: [''],
      city_id: [''],
      birth_date: [''],
      gender: ['1'],
      is_private: [0],
      sign_in_type: ['email'],
      is_active: ['1'],
      account_type: ['merchant'],
      interests: [[]],
      Store_logo: [null],
      commercial_register: [null],
      status: [1],
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
        
        this.oldStoreLogo = merchant.image_url || merchant.Store_logo || merchant.store_logo || merchant.image || null;
        this.oldCommercialRegister = merchant.commercial_register_url || merchant.commercial_register || null;

        if (merchant.country_id) {
          this.onCountryChange({ target: { value: merchant.country_id } });
        }
        
        this.merchantForm.patchValue({
          ...merchant,
          interests: merchant.interests?.map((i: any) => i.id) || [],
          account_type: merchant.type || merchant.account_type || 'merchant',
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

  formatImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('blob:')) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (url.includes('/api/uploads/')) return url.replace('/api/uploads/', '/uploads/');
      if (url.includes('/api/storage/')) return url.replace('/api/storage/', '/storage/');
      return url;
    }
    let clean = url.trim();
    if (clean.startsWith('/')) clean = clean.substring(1);
    if (clean.startsWith('storage/')) return `https://hayaapp.online/${clean}`;
    return `https://hayaapp.online/storage/${clean}`;
  }

  isPdf(url: string | null | undefined): boolean {
    if (!url) return false;
    const clean = url.toLowerCase().split('?')[0].split('#')[0];
    return clean.endsWith('.pdf');
  }

  onFileChange(event: any, type: 'Store_logo' | 'commercial_register') {
    const file = event.target.files[0];
    if (file) {
      if (type === 'Store_logo') {
        this.storeLogo = file;
        this.logoName = file.name;
        const reader = new FileReader();
        reader.onload = () => {
          this.storeLogoPreview = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
      if (type === 'commercial_register') {
        this.commercialRegister = file;
        this.registerName = file.name;
        const reader = new FileReader();
        reader.onload = () => {
          this.commercialRegisterPreview = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onSubmit() {
    if (this.loading) return;

    if (!this.merchantForm.value.name || !this.merchantForm.value.name.toString().trim()) {
      this.notification.error('Merchant name is required');
      return;
    }

    const formValue = { ...this.merchantForm.value };
    formValue.id = this.merchantId;
    if (formValue.gender !== null && formValue.gender !== undefined) formValue.gender = +formValue.gender;
    if (formValue.is_active !== null && formValue.is_active !== undefined) formValue.is_active = +formValue.is_active;
    if (formValue.status !== null && formValue.status !== undefined) formValue.status = +formValue.status;

    const formData = new FormData();
    Object.entries(formValue).forEach(([key, value]) => {
      if (key === 'interests') {
        formData.append(key, JSON.stringify(value || []));
      } else if (value !== null && value !== undefined && key !== 'Store_logo' && key !== 'commercial_register') {
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