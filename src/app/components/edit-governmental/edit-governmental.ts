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
      owner_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      activity: ['', Validators.required],
      country_id: ['', Validators.required],
      city_id: ['', Validators.required],
      sign_in_type: ['email'],
      is_active: ['1', Validators.required],
      account_type: ['governmental', Validators.required],
      interests: [[]],
      Store_logo: [null],
      commercial_register: [null],
      id_num: [''],
      birth_date: [''],
      expiration_date: [''],
      is_private: [0, Validators.required],
      verification: [1, Validators.required],
      created_at: [''],
      updated_at: [''],
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
        this.onCountryChange({ target: { value: governmental.country_id } });
        this.governmentalForm.patchValue({
          ...governmental,
          interests: governmental.interests?.map((i: any) => i.id) || [],
          account_type: governmental.account_type || 'governmental',
        });
        this.oldStoreLogo = governmental.Store_logo;
        this.oldCommercialRegister = governmental.commercial_register;
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
    if (this.governmentalForm.invalid) {
      this.notification.error('Please fill all required fields');
      return;
    }

    const formValue = { ...this.governmentalForm.value };
    formValue.id = this.governmentalId;

    const formData = new FormData();
    Object.entries(formValue).forEach(([key, value]) => {
      if (key === 'interests') {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
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
          this.router.navigate(['/governments']);
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