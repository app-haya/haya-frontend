import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DealService } from '../../services/deal.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-deals',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './deals.html',
  styleUrls: ['./deals.css']
})
export class Deals implements OnInit {
  deals: any[] = [];
  filteredDeals: any[] = [];
  loading: boolean = false;
  searchTerm: string = '';

  // Pagination
  currentPage: number = 1;
  lastPage: number = 1;

  // Reject Modal
  rejectReason: string = '';
  selectedDealId: number | null = null;

  constructor(private dealService: DealService) {}

  ngOnInit(): void {
    this.loadDeals();
  }

  loadDeals(page: number = 1) {
    this.loading = true;
    this.dealService.getAllPendingDeals(page).subscribe({
      next: (res: any) => {
        if (res.data?.data) {
          this.deals = res.data.data;
          this.currentPage = res.data.current_page;
          this.lastPage = res.data.last_page;
        } else {
          this.deals = res.data ?? [];
          this.currentPage = 1;
          this.lastPage = 1;
        }
        this.filteredDeals = [...this.deals];
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  search() {
    const term = this.searchTerm.toLowerCase();
    this.filteredDeals = this.deals.filter(
      d =>
        d.title?.toLowerCase().includes(term) ||
        d.account_number?.toLowerCase().includes(term)
    );
  }

  approve(id: number) {
    this.dealService.approveDeal(id).subscribe(() => {
      alert('Deal approved successfully');
      this.loadDeals(this.currentPage);
    });
  }

  // ---------- Reject Logic ----------
  openRejectModal(id: number) {
    this.selectedDealId = id;
    this.rejectReason = '';

    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('rejectModal')
    );
    modal.show();
  }

  confirmReject() {
    if (!this.rejectReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }

    this.dealService.rejectDeal(this.selectedDealId!, this.rejectReason).subscribe(() => {
      alert('Deal rejected successfully');

      const modal = (window as any).bootstrap.Modal.getInstance(
        document.getElementById('rejectModal')
      );
      modal.hide();

      this.loadDeals(this.currentPage);
    });
  }

  // ---------- Pagination ----------
  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.lastPage; i++) pages.push(i);
    return pages;
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
}
