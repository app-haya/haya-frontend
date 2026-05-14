import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DealService } from '../../services/deal.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-deals',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './deals.html',
  styleUrls: ['./deals.css']
})
export class Deals implements OnInit {
  deals: any[] = [];
  filteredDeals: any[] = [];
  loading: boolean = false;
  searchTerm: string = '';
  currentPage: number = 1;
  lastPage: number = 1;
  rejectReason: string = '';
  selectedDealId: number | null = null;

  constructor(
    private dealService: DealService,
    private notification: NotificationService
  ) {}

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
    // التحديث الفوري (Optimistic Update)
    this.deals = this.deals.filter(d => d.id !== id);
    this.filteredDeals = [...this.deals];

    this.dealService.approveDeal(id).subscribe({
      next: (res: any) => {
        this.notification.success('تم قبول الصفقة بنجاح');
        this.loadDeals(this.currentPage);
      },
      error: (err: any) => {
        this.notification.error('حدث خطأ أثناء القبول');
        this.loadDeals(this.currentPage);
      }
    });
  }

  openRejectModal(id: number) {
    this.selectedDealId = id;
    this.rejectReason = '';
    const modalElement = document.getElementById('rejectModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmReject() {
    if (!this.rejectReason.trim()) {
      this.notification.error('برجاء كتابة سبب الرفض');
      return;
    }
    const id = this.selectedDealId!;
    
    // التحديث الفوري (Optimistic Update)
    this.deals = this.deals.filter(d => d.id !== id);
    this.filteredDeals = [...this.deals];

    this.dealService.rejectDeal(id, this.rejectReason).subscribe({
      next: (res: any) => {
        this.notification.success('تم رفض الصفقة بنجاح');
        const modalElement = document.getElementById('rejectModal');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          if (modal) modal.hide();
        }
        this.loadDeals(this.currentPage);
      },
      error: (err: any) => {
        this.notification.error('حدث خطأ أثناء الرفض');
        this.loadDeals(this.currentPage);
      }
    });
  }

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