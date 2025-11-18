import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DealService } from '../../services/deal.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-rejected-deals',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './rejected-deals.html',
  styleUrls: ['./rejected-deals.css'],
})
export class RejectedDeals implements OnInit {
  deals: any[] = [];
  filteredDeals: any[] = [];
  loading = false;
  searchTerm = '';

  currentPage = 1;
  lastPage = 1;

  constructor(
    private dealService: DealService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDeals();
  }

  loadDeals(page: number = 1) {
    this.loading = true;

    this.dealService.getAllRejectedDeals(page).subscribe({
      next: (res: any) => {
        if (res.data?.data) {
          this.deals = res.data.data;
          this.currentPage = res.data.current_page;
          this.lastPage = res.data.last_page;
        } else {
          this.deals = res.data ?? [];
        }

        this.filteredDeals = [...this.deals];
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  search() {
    const term = this.searchTerm.toLowerCase();
    this.filteredDeals = this.deals.filter(
      (d) =>
        d.title?.toLowerCase().includes(term) ||
        d.account_number?.toLowerCase().includes(term)
    );
  }

  getPageNumbers(): number[] {
    return Array(this.lastPage)
      .fill(0)
      .map((x, i) => i + 1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.lastPage) this.loadDeals(page);
  }

  prevPage() {
    if (this.currentPage > 1) this.loadDeals(this.currentPage - 1);
  }

  nextPage() {
    if (this.currentPage < this.lastPage) this.loadDeals(this.currentPage + 1);
  }

  // ============= زر الموافقة =============
  approveDeal(id: number) {
    if (!confirm('Are you sure you want to approve this deal?')) return;

    this.dealService.approveDeal(id).subscribe({
      next: () => {
        this.notification.success('Deal approved successfully!');

        this.loadDeals(this.currentPage);
      },
      error: () => {
        this.notification.error('Failed to approve the deal.');
      },
    });
  }
}
