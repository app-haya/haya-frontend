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
  imports: [CommonModule, ReactiveFormsModule],
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
      id_num: ['', Validators.required],
      expiration_date: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      activity: ['', Validators.required],
      phone: ['', Validators.required],
      country_id: ['', Validators.required],
      city_id: ['', Validators.required],
      birth_date: ['', Validators.required],
      sign_in_type: ['email'],
      is_active: ['1', Validators.required],
      account_type: ['governmental', Validators.required],
      interests: [[]],
      Store_logo: [null],
      commercial_register: [null],
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
      error: () => this.notification.error('❌ Failed to load countries'),
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

  loadInterests() {
    this.interestsService.getInterests('en').subscribe({
      next: (res) => (this.interestsList = res?.data?.data || res?.data || []),
      error: () => this.notification.error('Failed to load interests'),
    });
  }

  loadGovernmentalData() {
    this.governmentalService.show(this.governmentalId).subscribe({
      next: (res) => {
        const governmental = res.data;
        if (!governmental) {
          this.notification.error('Governmental not found');
          return;
        }

        // تحميل المدن بناءً على الدولة المختارة
        this.onCountryChange({ target: { value: governmental.country_id } });

        this.governmentalForm.patchValue({
          ...governmental,
          interests: governmental.interests?.map((i: any) => i.id) || [],
          account_type: governmental.account_type || 'governmental',
        });

        this.oldStoreLogo = governmental.Store_logo;
        this.oldCommercialRegister = governmental.commercial_register;
      },
      error: () => this.notification.error('Failed to load governmental data'),
    });
  }

  onInterestChange(event: any) {
    const selected = this.governmentalForm.value.interests as number[];
    const interestId = parseInt(event.target.value);
    if (event.target.checked) {
      if (!selected.includes(interestId)) selected.push(interestId);
    } else {
      const index = selected.indexOf(interestId);
      if (index >= 0) selected.splice(index, 1);
    }
    this.governmentalForm.patchValue({ interests: selected });
  }

  onFileChange(event: any, type: 'Store_logo' | 'commercial_register') {
    const file = event.target.files[0];
    if (file) {
      if (type === 'Store_logo') this.storeLogo = file;
      if (type === 'commercial_register') this.commercialRegister = file;
    }
  }

  onSubmit() {
    if (this.governmentalForm.invalid) {
      this.notification.error('Please fill all required fields');
      return;
    }

    const formValue = this.governmentalForm.value;
    formValue.id = this.governmentalId;

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
    this.governmentalService.update(formData).subscribe({
      next: (res) => {
        if (res.errorcode === '0') {
          this.notification.success('Governmental updated successfully');
          this.router.navigate(['/governments']);
        } else {
          this.notification.error(res.message || ' Update failed');
        }
        this.loading = false;
      },
      error: (err) => {
        const message =
          err.error?.message || ' Failed to update governmental';
        this.notification.error(message);
        this.loading = false;
      },
    });
  }
}
