import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LocationService } from '../../services/location.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-cities',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './cities.html',
  styleUrls: ['./cities.css'],
})
export class Cities implements OnInit {
  cities: any[] = [];
  filteredCities: any[] = [];
  allCities: any[] = [];
  countries: any[] = [];
  loading = false;
  searchTerm = '';
  selectedCountryId: number | null = null;
  showModal = false;
  modalTitle = 'Add City';
  editingCity: any = null;
  currentPage = 1;
  lastPage = 1;
  total: number = 0;
  isServerPaginated = false;

  formData = {
    id: null,
    name_en: '',
    name_ar: '',
    country_id: null,
  };

  constructor(
    private locationService: LocationService,
    private notification: NotificationService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.loadCities();
    this.loadCountries();
  }

  loadCities(page: number = 1): void {
    this.loading = true;
    const body: any = { lang: 'en', page };
    if (this.selectedCountryId) body['country_id'] = this.selectedCountryId;

    this.locationService.getCities(body).subscribe({
      next: (res) => {
        // Handle Laravel paginated response: { data: { current_page, last_page, total, data: [...] } }
        if (res?.data?.data && Array.isArray(res.data.data)) {
          this.isServerPaginated = true;
          this.cities = res.data.data;
          this.filteredCities = [...this.cities];
          this.currentPage = res.data.current_page || page;
          this.lastPage = res.data.last_page || 1;
          this.total = res.data.total || this.cities.length;
        } else {
          // Response is a flat array of cities (e.g. res.data = [...] or res = [...])
          this.isServerPaginated = false;
          const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
          this.allCities = list;
          this.applyClientPagination(page);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading cities:', err);
        this.loading = false;
      },
    });
  }

  applyClientPagination(page: number = 1): void {
    const term = this.searchTerm.trim().toLowerCase();
    let filtered = this.allCities;
    if (term) {
      filtered = this.allCities.filter((city) => {
        const nameEn = (city.name_en || city.name || '').toLowerCase();
        const nameAr = (city.name_ar || '').toLowerCase();
        const countryName = (
          city.country?.name_en ||
          city.country?.name_ar ||
          ''
        ).toLowerCase();
        return (
          nameEn.includes(term) ||
          nameAr.includes(term) ||
          countryName.includes(term)
        );
      });
    }

    this.total = filtered.length;
    const perPage = 10;
    this.lastPage = Math.ceil(this.total / perPage) || 1;
    this.currentPage = Math.min(Math.max(1, page), this.lastPage);

    const startIndex = (this.currentPage - 1) * perPage;
    this.cities = filtered.slice(startIndex, startIndex + perPage);
    this.filteredCities = [...this.cities];
  }

  loadCountries(): void {
    this.locationService.getCountries('en').subscribe({
      next: (res) => {
        this.countries = res?.data?.data || res?.data || [];
      },
      error: (err) => console.error('Error loading countries:', err),
    });
  }

  openAddModal(): void {
    this.modalTitle = 'Add City';
    this.showModal = true;
    this.editingCity = null;
    this.formData = { id: null, name_en: '', name_ar: '', country_id: null };
  }

  openEditModal(city: any): void {
    this.modalTitle = 'Edit City';
    this.showModal = true;
    this.editingCity = city;
    this.locationService.showCity(city.id).subscribe({
      next: (res) => {
        const c = res?.city;
        if (c) {
          this.formData = {
            id: c.id,
            name_en: c.name_en,
            name_ar: c.name_ar,
            country_id: c.country_id,
          };
        }
      },
      error: (err) => {
        console.error('Error loading city details:', err);
        this.notification.error('Failed to load city details');
      },
    });
  }

  saveCity(): void {
    const data = { ...this.formData, lang: 'en' };
    const request$ = this.editingCity
      ? this.locationService.updateCity(data)
      : this.locationService.addCity(data);

    request$.subscribe({
      next: (res) => {
        this.notification.success('City saved successfully');
        this.showModal = false;
        this.loadCities(this.currentPage);
      },
      error: (err) => {
        console.error('Error saving city:', err);
        this.notification.error('Failed to save city');
      },
    });
  }

  deleteCity(id: number): void {
    this.dialogService.confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this city?',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: () => {
        this.locationService.deleteCity({ id }).subscribe({
          next: (res) => {
            this.notification.success(res?.message || 'City deleted successfully');
            this.loadCities(this.currentPage);
          },
          error: (err) => {
            console.error('Error deleting city:', err);
            this.notification.error(err?.error?.message || 'Failed to delete city');
          },
        });
      },
    });
  }

  filterCities(): void {
    if (this.isServerPaginated) {
      const term = this.searchTerm.trim().toLowerCase();
      if (!term) {
        this.filteredCities = [...this.cities];
        return;
      }
      this.filteredCities = this.cities.filter((city) => {
        const nameEn = (city.name_en || city.name || '').toLowerCase();
        const nameAr = (city.name_ar || '').toLowerCase();
        const countryName = (
          city.country?.name_en ||
          city.country?.name_ar ||
          ''
        ).toLowerCase();
        return (
          nameEn.includes(term) ||
          nameAr.includes(term) ||
          countryName.includes(term)
        );
      });
    } else {
      this.applyClientPagination(1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.lastPage) {
      this.goToPage(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  goToPage(page: number): void {
    if (page !== this.currentPage && page >= 1 && page <= this.lastPage) {
      if (this.isServerPaginated) {
        this.loadCities(page);
      } else {
        this.applyClientPagination(page);
      }
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(this.currentPage - 2, 1);
    let endPage = Math.min(startPage + maxPagesToShow - 1, this.lastPage);
    startPage = Math.max(endPage - maxPagesToShow + 1, 1);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages.length ? pages : [1];
  }
}