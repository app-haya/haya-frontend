import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MerchantService } from '../../services/merchant.service';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-merchants',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './merchants.html',
  styleUrls: ['./merchants.css']
})
export class Merchants implements OnInit {
  merchants: any[] = [];
  filteredMerchants: any[] = [];
  searchTerm = '';
  loading = true;

  // Pagination
  currentPage = 1;
  lastPage = 1;

  constructor(private merchantService: MerchantService,private notification: NotificationService,
  ) {}

  ngOnInit() {
    this.loadMerchants();
  }

  loadMerchants(page: number = 1) {
    this.loading = true;
    this.merchantService.getAll().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.merchants = res.data.data || [];
          this.filteredMerchants = this.merchants;
          this.currentPage = res.data.current_page;
          this.lastPage = res.data.last_page;
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      }
    });
  }

  // 🔍 بحث
  search() {
    const term = this.searchTerm.toLowerCase();
    this.filteredMerchants = this.merchants.filter((m) =>
      (m.name && m.name.toLowerCase().includes(term)) ||
      (m.email && m.email.toLowerCase().includes(term)) ||
      (m.phone && m.phone.includes(term))
    );
  }

  // 🧭 Pagination controls
  getPageNumbers(): number[] {
    return Array(this.lastPage)
      .fill(0)
      .map((_, i) => i + 1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.lastPage) {
      this.currentPage = page;
      this.loadMerchants(page);
    }
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.loadMerchants(this.currentPage);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadMerchants(this.currentPage);
    }
  }

  // 🗑️ حذف تاجر
  deleteMerchant(id: number) {
    if (!confirm('Are you sure you want to delete this merchant?')) return;

    this.merchantService.delete(id).subscribe({
      next: (res) => {
              this.notification.success(' Merchant deleted successfully');

        this.loadMerchants(this.currentPage);
      },
      error: (err) => {
              this.notification.error(' Merchant deleted Failed');
      }
    });
  }
}
