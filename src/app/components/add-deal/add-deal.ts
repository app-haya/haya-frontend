import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DealService } from '../../services/deal.service';
import { UsersService } from '../../services/users.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-add-deal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-deal.html',
  styleUrls: ['./add-deal.css'],
})
export class AddDeal implements OnInit {
  dealForm!: FormGroup;
  countries: any[] = [];
  cities: any[] = [];
  usersList: any[] = [];
  accountFile: File | null = null;
  invoiceFile: File | null = null;
  imagesFiles: File[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dealService: DealService,
    private usersService: UsersService,
    private notification: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCountries();
    this.loadUsers();
  }

  initializeForm(): void {
    this.dealForm = this.fb.group({
      user_id: ['', Validators.required],
      title: ['', Validators.required],
      is_business: [false, Validators.required],
      account_number: [''],
      original_price: ['', Validators.required],
      total_price: ['', Validators.required],
      invoice: [''],
      country_id: ['', Validators.required],
      city_id: ['', Validators.required],
      description: [''],
      quantity: [1, Validators.required],
      is_new: [true, Validators.required],
      notes: [''],
      features: this.fb.array([this.fb.control('', Validators.required)]),
      images: [''],
    });
  }

  get features(): FormArray {
    return this.dealForm.get('features') as FormArray;
  }

  addFeature(): void {
    this.features.push(this.fb.control('', Validators.required));
  }

  removeFeature(index: number): void {
    this.features.removeAt(index);
  }

  loadUsers(): void {
    this.dealService.getUsersSimpleList().subscribe({
      next: (res) => {
        this.usersList = res.data || [];
      },
      error: () => this.notification.error('Failed to load users'),
    });
  }

  onUserSelect(event: any): void {
    const userId = event.target.value;
    const selected = this.usersList.find((u) => String(u.id) === String(userId));
    if (selected) {
      if (selected.type === 'business' || selected.is_business == 1) {
        this.dealForm.patchValue({ is_business: true });
      } else if (selected.type === 'user' || selected.type === 'personal') {
        this.dealForm.patchValue({ is_business: false });
      }
    }
  }

  loadCountries(): void {
    this.usersService.getCountries('en').subscribe({
      next: (res) => {
        this.countries = res.data || [];
      },
      error: () => this.notification.error('Failed to load countries'),
    });
  }

  onCountryChange(event: any): void {
    const countryId = event.target.value;
    this.cities = [];
    if (countryId) {
      this.usersService.getCities(countryId, 'en').subscribe({
        next: (res) => {
          this.cities = res.data || [];
        },
        error: () => this.notification.error('Failed to load cities'),
      });
    }
  }

  onFileChange(event: any, type: 'account_number' | 'invoice' | 'images'): void {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    if (type === 'account_number') {
      this.accountFile = files[0];
    } else if (type === 'invoice') {
      this.invoiceFile = files[0];
    } else if (type === 'images') {
      this.imagesFiles = Array.from(files);
    }
  }

  // ── Financial Calculation Helpers ──
  onOriginalPriceInput(event: any): void {
    const val = event?.target?.value;
    const currentTotal = this.dealForm?.get('total_price')?.value;
    if (!currentTotal || Number(currentTotal) === 0) {
      this.dealForm?.patchValue({ total_price: val });
    }
  }

  getTotalPrice(): number {
    const total = Number(this.dealForm?.get('total_price')?.value);
    if (!isNaN(total) && total > 0) return total;
    const orig = Number(this.dealForm?.get('original_price')?.value);
    if (!isNaN(orig) && orig > 0) return orig;
    return 0;
  }

  isBusiness(): boolean {
    const val = this.dealForm?.get('is_business')?.value;
    return val === true || val === 'true' || val === 1 || val === '1';
  }

  getHayaCommission(): number {
    return this.getTotalPrice() * 0.025;
  }

  getVatRate(): number {
    return this.isBusiness() ? 15 : 0;
  }

  getVatAmount(): number {
    return (this.getTotalPrice() * this.getVatRate()) / 100;
  }

  getSellerNet(): number {
    const total = this.getTotalPrice();
    return Math.max(0, total - this.getHayaCommission() - this.getVatAmount());
  }

  submit(): void {
    if (!this.accountFile || !this.invoiceFile || this.imagesFiles.length === 0) {
      this.notification.error('All files are required');
      return;
    }
    if (this.dealForm.invalid) {
      this.notification.error('Please fill all required fields');
      return;
    }
    this.loading = true;
    const formData = new FormData();
    const value = this.dealForm.value;
    formData.append('user_id', value.user_id);
    formData.append('title', value.title);
    formData.append('is_business', value.is_business ? '1' : '0');
    formData.append('account_number', this.accountFile);
    formData.append('original_price', value.original_price);
    formData.append('total_price', value.total_price);
    formData.append('invoice', this.invoiceFile);
    formData.append('country_id', value.country_id);
    formData.append('city_id', value.city_id);
    formData.append('description', value.description || '');
    formData.append('quantity', value.quantity);
    formData.append('is_new', value.is_new ? '1' : '0');
    formData.append('status', 'pending');
    formData.append('notes', value.notes || '');
    value.features.forEach((f: string, i: number) => {
      formData.append(`features[${i}]`, f);
    });
    this.imagesFiles.forEach((img) => formData.append('images[]', img));

    this.dealService.addDeal(formData).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.errorcode === '0') {
          this.notification.success('Deal added successfully');
          this.router.navigate(['/admin/deals']);
          this.dealForm.reset();
          this.accountFile = null;
          this.invoiceFile = null;
          this.imagesFiles = [];
        } else {
          this.notification.error(res.message);
        }
      },
      error: () => {
        this.loading = false;
        this.notification.error('Failed to add deal');
      },
    });
  }
}