import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MerchantService } from '../../services/merchant.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-merchants',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './merchants.html',
  styleUrls: ['./merchants.css']
})
export class Merchants implements OnInit {
  merchants: any[] = [];
  filteredMerchants: any[] = [];
  searchTerm = '';
  loading = true;
  currentPage = 1;
  lastPage = 1;

  constructor(
    private merchantService: MerchantService,
    private notification: NotificationService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.loadMerchants();
  }

  loadMerchants(page: number = 1) {
    this.loading = true;
    this.merchantService.getAll(page).subscribe({
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

  search() {
    const term = this.searchTerm.toLowerCase();
    this.filteredMerchants = this.merchants.filter((m) =>
      (m.name && m.name.toLowerCase().includes(term)) ||
      (m.email && m.email.toLowerCase().includes(term)) ||
      (m.phone && m.phone.includes(term))
    );
  }

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

  deleteMerchant(id: number) {
    this.dialogService.confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this merchant?',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: () => {
        this.merchantService.delete(id).subscribe({
          next: (res) => {
            this.notification.success('Merchant deleted successfully');
            this.loadMerchants(this.currentPage);
          },
          error: (err) => {
            this.notification.error('Merchant deleted Failed');
          }
        });
      }
    });
  }
}