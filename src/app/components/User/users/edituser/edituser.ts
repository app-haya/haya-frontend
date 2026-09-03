import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { UsersService } from '../../../../services/users.service';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
  ],
  templateUrl: './edituser.html',
  styleUrls: ['./edituser.css'],
})
export class EditUser implements OnInit {
  userForm!: FormGroup;
  countries: any[] = [];
  cities: any[] = [];
  userId!: number;
  loading = false;
  isLoadingCities = false;
  userImageName: string = '';
  userImageUrl: string = '';

  interestsList: { id: number; name: string }[] = [
    { id: 1, name: 'Education' },
    { id: 2, name: 'Sports' },
    { id: 3, name: 'Culture' },
    { id: 4, name: 'Technology' },
    { id: 5, name: 'Music' },
    { id: 6, name: 'Travel' },
    { id: 7, name: 'Reading' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private usersService: UsersService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.loadCountries();
    this.loadUser();
  }

  initForm() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      gender: ['1', Validators.required],
      birth_date: ['', Validators.required],
      activity: [''],
      interests: [[]],
      country_id: ['', Validators.required],
      city_id: ['', Validators.required],
      is_private: ['0'],
      language: ['ar'],
      sign_in_type: ['normal'],
      account_type: ['user'],
      is_active: ['1'],
      image: [''],
    });
  }

  loadUser() {
    this.loading = true;
    this.usersService.showUser(this.userId).subscribe({
      next: (res: any) => {
        const user = res?.user || res?.data?.user || res?.data || res;

        if (!user || (typeof user === 'object' && !user.id && !user.name && !user.email)) {
          console.error('User data not found in response:', res);
          this.notification.error('Failed to load user data');
          this.loading = false;
          return;
        }

        // Interests mapping
        let interests: number[] = [];
        if (Array.isArray(user.interests)) {
          interests = user.interests.map((item: any) => typeof item === 'object' ? Number(item.id) : Number(item));
        } else if (typeof user.interests === 'string') {
          try {
            const parsed = JSON.parse(user.interests.replace(/'/g, '"'));
            if (Array.isArray(parsed)) interests = parsed.map((i: any) => Number(i));
          } catch (e) {
            console.error('Failed to parse interests:', e);
          }
        }

        this.userImageUrl = user.image_url || user.image || '';

        // Gender mapping (1: Male, 2: Female)
        let genderVal: number = 1;
        if (user.gender !== undefined && user.gender !== null) {
          const gStr = user.gender.toString().toLowerCase();
          if (gStr === '2' || gStr === 'female' || gStr === 'أنثى') {
            genderVal = 2;
          } else {
            genderVal = 1;
          }
        }

        const countryVal = user.country_id !== undefined && user.country_id !== null ? Number(user.country_id) : '';
        const cityVal = user.city_id !== undefined && user.city_id !== null ? Number(user.city_id) : '';

        let birthDateVal = user.birth_date || user.dob || user.date_of_birth || '';
        if (typeof birthDateVal === 'string' && birthDateVal.includes(' ')) {
          birthDateVal = birthDateVal.split(' ')[0];
        }

        this.userForm.patchValue({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          gender: genderVal,
          birth_date: birthDateVal,
          country_id: countryVal,
          city_id: cityVal,
          account_type: user.type || user.account_type || 'user',
          is_active: user.status !== undefined ? (user.status == 1 ? '1' : '0') : (user.is_active !== undefined ? (user.is_active == 1 ? '1' : '0') : '1'),
          is_private: user.is_private !== undefined ? (user.is_private == 1 ? '1' : '0') : '0',
          interests: interests,
          image: '',
        });

        if (countryVal) {
          this.loadCities(Number(countryVal));
        }

        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading user:', err);
        this.notification.error('Failed to load user data');
        this.loading = false;
      },
    });
  }

  loadCountries() {
    this.usersService.getCountries('ar').subscribe({
      next: (res) => (this.countries = res.data || res || []),
      error: () => this.notification.error('Failed to load countries'),
    });
  }

  loadCities(countryId: number) {
    this.isLoadingCities = true;
    this.usersService.getCities(countryId, 'ar').subscribe({
      next: (res) => {
        this.cities = res.data || res || [];
        this.isLoadingCities = false;
      },
      error: () => {
        this.notification.error('Failed to load cities');
        this.isLoadingCities = false;
      },
    });
  }

  toggleInterest(interestId: number) {
    const selected = [...(this.userForm.value.interests || [])];
    const index = selected.indexOf(interestId);
    if (index >= 0) {
      selected.splice(index, 1);
    } else {
      selected.push(interestId);
    }
    this.userForm.patchValue({ interests: selected });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.userImageName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.userForm.patchValue({ image: reader.result });
        this.userImageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onCountryChange(event: any): void {
    const countryId = event.target.value;
    if (countryId && !isNaN(parseInt(countryId))) {
      this.loadCities(parseInt(countryId));
    } else {
      this.cities = [];
      this.userForm.patchValue({ city_id: '' });
    }
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    const interests = this.userForm.value.interests || [];
    const interestsString = "['" + interests.join("','") + "']";

    const formData = {
      id: this.userId,
      ...this.userForm.value,
      interests: interestsString,
    };

    this.loading = true;
    this.usersService.updateUser(formData).subscribe({
      next: () => {
        this.notification.success('User updated successfully');
        this.router.navigate(['/admin/users']);
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Failed to update user');
        this.loading = false;
      },
    });
  }
}