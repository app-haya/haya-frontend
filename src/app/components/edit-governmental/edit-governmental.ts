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
import { GovernmentalService } from '../../services/governmental.service';
import { UsersService } from '../../services/users.service';
import { InterestsService } from '../../services/interests.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-edit-governmental',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './edit-governmental.html',
  styleUrls: ['./edit-governmental.css'],
})
export class EditGovernmental implements OnInit {
  governmentalForm!: FormGroup;
  governmentalId!: number;
  countries: any[] = [];
  cities: any[] = [];
  interestsList: any[] = [];
  loading = false;
  storeLogo: File | null = null;
  commercialRegister: File | null = null;
  oldStoreLogo: string | null = null;
  oldCommercialRegister: string | null = null;
  logoName: string = '';
  registerName: string = '';

  storeLogoPreview: string | null = null;
  commercialRegisterPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private governmentalService: GovernmentalService,
    private usersService: UsersService,
    private interestsService: InterestsService,
    private notification: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.governmentalId = +this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.loadCountries();
    this.loadInterests();
    this.loadGovernmentalData();
  }

  initForm() {
    this.governmentalForm = this.fb.group({
      name: ['', Validators.required],
      owner_name: [''],
      email: ['', Validators.email],
      phone: [''],
      activity: [''],
      country_id: [''],
      city_id: [''],
      sign_in_type: ['email'],
      is_active: ['1'],
      account_type: ['governmental'],
      interests: [[]],
      Store_logo: [null],
      commercial_register: [null],
      id_num: [''],
      birth_date: [''],
      expiration_date: [''],
      is_private: [0],
      verification: [1],
      created_at: [''],
      updated_at: [''],
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
      next: (res) => (this.interestsList = res?.data?.data || res?.data || []),
      error: () => this.notification.error('Failed to load interests'),
    });
  }

  loadGovernmentalData() {
    this.loading = true;
    this.governmentalService.show(this.governmentalId).subscribe({
      next: (res) => {
        this.loading = false;
        const governmental = res.data;
        if (!governmental) {
          this.notification.error('Governmental not found');
          return;
        }
        if (governmental.country_id) {
          this.onCountryChange({ target: { value: governmental.country_id } });
        }
        this.governmentalForm.patchValue({
          ...governmental,
          interests: governmental.interests?.map((i: any) => i.id) || [],
          account_type: governmental.account_type || 'governmental',
        });
        this.oldStoreLogo = governmental.Store_logo || governmental.image_url || governmental.image || governmental.store_logo || null;
        this.oldCommercialRegister = governmental.commercial_register || governmental.commercial_register_url || null;
      },
      error: () => {
        this.loading = false;
        this.notification.error('Failed to load governmental data');
      },
    });
  }

  toggleInterest(interestId: number) {
    const selected = [...(this.governmentalForm.value.interests || [])];
    const index = selected.indexOf(interestId);
    if (index >= 0) {
      selected.splice(index, 1);
    } else {
      selected.push(interestId);
    }
    this.governmentalForm.patchValue({ interests: selected });
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

    if (!this.governmentalForm.value.name || !this.governmentalForm.value.name.toString().trim()) {
      this.notification.error('Entity name is required');
      return;
    }

    const formValue = { ...this.governmentalForm.value };
    formValue.id = this.governmentalId;

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
    this.governmentalService.update(formData).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.errorcode === '0') {
          this.notification.success('Governmental updated successfully');
          this.router.navigate(['/admin/governments']);
        } else {
          this.notification.error(res.message || 'Update failed');
        }
      },
      error: (err) => {
        this.loading = false;
        this.notification.error(
          err.error?.message || 'Failed to update governmental'
        );
      },
    });
  }
}