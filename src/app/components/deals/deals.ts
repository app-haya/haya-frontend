import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DealService } from '../../services/deal.service';
import { NotificationService } from '../../services/notification.service';
import { DashboardService } from '../../services/dashboard.service';

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
  loading = false;
  searchTerm = '';
  currentPage = 1;
  lastPage = 1;
  total = 0;
  perPage = 20;

  activeTab: 'pending' | 'approved' | 'rejected' = 'pending';

  // Reject modal
  showRejectModal = false;
  rejectReason = '';
  selectedDealId: number | null = null;
  rejectLoading = false;

  // Image preview modal
  showImageModal = false;
  previewImageUrl = '';
  previewSafeUrl: SafeResourceUrl | null = null;
  isPreviewPdf = false;
  previewModalTitle = '';

  // Actions loading states
  approvingId: number | null = null;
  rejectingId: number | null = null;

  constructor(
    private dealService: DealService,
    private notification: NotificationService,
    private sanitizer: DomSanitizer,
    public translate: TranslateService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    const savedTab = sessionStorage.getItem('deals_tab') as 'pending' | 'approved' | 'rejected';
    if (savedTab && ['pending', 'approved', 'rejected'].includes(savedTab)) {
      this.activeTab = savedTab;
    }
    this.loadDeals();
  }

  loadDeals(page: number = 1): void {
    this.loading = true;
    this.deals = [];
    this.filteredDeals = [];

    let apiObservable$;
    if (this.activeTab === 'pending') {
      apiObservable$ = this.dealService.getAllPendingDeals(page);
    } else if (this.activeTab === 'approved') {
      apiObservable$ = this.dealService.getAllApprovedDeals(page);
    } else {
      apiObservable$ = this.dealService.getAllRejectedDeals(page);
    }

    apiObservable$.subscribe({
      next: (res: any) => {
        if (res.data?.data) {
          this.deals = res.data.data;
          this.currentPage = res.data.current_page;
          this.lastPage = res.data.last_page;
          this.total = res.data.total;
        } else {
          this.deals = res.data ?? [];
          this.currentPage = 1;
          this.lastPage = 1;
          this.total = this.deals.length;
        }
        this.search();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notification.error('Failed to load deals');
      }
    });
  }

  switchTab(tab: 'pending' | 'approved' | 'rejected'): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    sessionStorage.setItem('deals_tab', tab);
    this.currentPage = 1;
    this.searchTerm = '';
    this.loadDeals(1);
  }

  search(): void {
    const term = this.searchTerm.toLowerCase();
    if (!term) {
      this.filteredDeals = [...this.deals];
      return;
    }
    this.filteredDeals = this.deals.filter(
      d =>
        d.title?.toLowerCase().includes(term) ||
        d.account_number?.toLowerCase().includes(term)
    );
  }


  approve(id: number): void {
    this.approvingId = id;
    this.dealService.approveDeal(id).subscribe({
      next: () => {
        this.approvingId = null;
        this.notification.success('Deal approved successfully');
        this.loadDeals(this.currentPage);
        this.dashboardService.triggerRefresh();
      },
      error: (err: any) => {
        this.approvingId = null;
        const msg = err?.error?.message || 'An error occurred during approval';
        this.notification.error(msg);
      }
    });
  }

  openRejectModal(id: number): void {
    this.selectedDealId = id;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedDealId = null;
    this.rejectLoading = false;
  }

  confirmReject(): void {
    if (this.selectedDealId === null) return;
    if (!this.rejectReason.trim()) {
      this.notification.error('Please write the rejection reason');
      return;
    }

    this.rejectLoading = true;
    this.dealService.rejectDeal(this.selectedDealId, this.rejectReason).subscribe({
      next: () => {
        this.rejectLoading = false;
        this.notification.success('Deal rejected successfully');
        this.closeRejectModal();
        this.loadDeals(this.currentPage);
        this.dashboardService.triggerRefresh();
      },
      error: (err: any) => {
        this.rejectLoading = false;
        const msg = err?.error?.message || 'An error occurred during rejection';
        this.notification.error(msg);
      }
    });
  }

  openImageModal(url: string, title: string, event: Event): void {
    event.preventDefault();
    const formattedUrl = this.formatImageUrl(url);
    this.previewImageUrl = formattedUrl;
    
    // Check if PDF
    this.isPreviewPdf = formattedUrl.toLowerCase().endsWith('.pdf');
    if (this.isPreviewPdf) {
      this.previewSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(formattedUrl);
    } else {
      this.previewSafeUrl = null;
    }
    
    this.previewModalTitle = title;
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.previewImageUrl = '';
    this.previewSafeUrl = null;
    this.isPreviewPdf = false;
    this.previewModalTitle = '';
  }

  formatImageUrl(url: string): string {
    if (!url) return '';
    
    // Check if it's already an absolute URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (url.includes('/api/uploads/')) {
        return url.replace('/api/uploads/', '/uploads/');
      }
      if (url.includes('/api/storage/')) {
        return url.replace('/api/storage/', '/storage/');
      }
      return url;
    }
    
    let cleanPath = url.trim();
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    
    // If the path already has "storage/"
    if (cleanPath.startsWith('storage/')) {
      return `https://hayaapp.online/${cleanPath}`;
    }
    // If it starts with "uploads/" or "deals_files/"
    if (cleanPath.startsWith('uploads/') || cleanPath.startsWith('deals_files/')) {
      return `https://hayaapp.online/storage/${cleanPath}`;
    }
    
    // Fallback: assume it is under storage/
    return `https://hayaapp.online/storage/${cleanPath}`;
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.loadDeals(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.lastPage) {
      this.loadDeals(this.currentPage + 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.lastPage, this.currentPage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getActivityLabel(isActive: any): string {
    return isActive ? 'Active' : 'Inactive';
  }

  getLocalizedName(obj: any): string {
    if (!obj) return '—';
    const currentLang = this.translate.currentLang || 'ar';
    return currentLang === 'ar' ? (obj.name_ar || obj.name_en || '—') : (obj.name_en || obj.name_ar || '—');
  }
}