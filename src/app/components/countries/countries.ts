import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-countries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './countries.html',
  styleUrls: ['./countries.css']
})
export class Countries implements OnInit {
  countries: any[] = [];
  filteredCountries: any[] = [];
  formData = { id: null, name_en: '', name_ar: '' };
  editing = false;
  loading = false;
  showModal = false;
  searchTerm = '';

  // pagination vars
  currentPage = 1;
  lastPage = 1;

  constructor(private locationService: LocationService) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries(page: number = 1): void {
    this.loading = true;
    this.locationService.getCountries('en', page).subscribe({
      next: (res) => {
        this.countries = res?.data?.data || [];
        this.filteredCountries = this.countries;
        this.currentPage = res?.data?.current_page || 1;
        this.lastPage = res?.data?.last_page || 1;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading countries:', err);
        this.loading = false;
      }
    });
  }

  // Pagination control
  nextPage(): void {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.loadCountries(this.currentPage);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCountries(this.currentPage);
    }
  }

  goToPage(page: number): void {
    if (page !== this.currentPage) {
      this.loadCountries(page);
    }
  }

getPageNumbers(): number[] {
  const pages = Array.from({ length: this.lastPage || 1 }, (_, i) => i + 1);
  return pages.length ? pages : [1]; 
}
  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredCountries = this.countries.filter(
      (c) =>
        c.name_en?.toLowerCase().includes(term) ||
        c.name_ar?.toLowerCase().includes(term)
    );
  }

  openAddModal(): void {
    this.formData = { id: null, name_en: '', name_ar: '' };
    this.editing = false;
    this.showModal = true;
  }

  editCountry(id: number): void {
    this.locationService.showCountry(id).subscribe({
      next: (res) => {
        this.formData = {
          id: res.country.id,
          name_ar: res.country.name_ar,
          name_en: res.country.name_en
        };
        this.editing = true;
        this.showModal = true;
      },
      error: (err) => {
        console.error('Error fetching country:', err);
        alert('Failed to load country data.');
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  saveCountry(): void {
    const saveAction = this.editing
      ? this.locationService.updateCountry(this.formData)
      : this.locationService.addCountry(this.formData);

    saveAction.subscribe({
      next: () => {
        this.closeModal();
        this.loadCountries(this.currentPage);
      },
      error: (err) => console.error('Error saving country:', err)
    });
  }

  deleteCountry(id: number): void {
    if (confirm('Are you sure you want to delete this country?')) {
      this.locationService.deleteCountry({ id }).subscribe(() => {
        this.loadCountries(this.currentPage);
      });
    }
  }

  resetForm(): void {
    this.formData = { id: null, name_en: '', name_ar: '' };
    this.editing = false;
  }
}
