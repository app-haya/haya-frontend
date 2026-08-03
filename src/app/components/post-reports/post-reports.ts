import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf, NgClass, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PostReportsService } from '../../services/post-reports.service';

@Component({
  selector: 'app-post-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    NgFor,
    NgIf,
    NgClass,
    DatePipe
  ],
  templateUrl: './post-reports.html',
  styleUrls: ['./post-reports.css']
})
export class PostReports implements OnInit {
  reports: any[] = [];
  filteredReports: any[] = [];
  loading: boolean = false;
  activeTab: 'pending' | 'reviewed' | 'resolved' = 'pending';

  currentPage: number = 1;
  lastPage: number = 1;
  perPage: number = 20;
  total: number = 0;

  searchTerm: string = '';
  actionLoadingId: number | null = null;

  // Modal States
  showHideModal: boolean = false;
  showDeleteModal: boolean = false;
  showDetailModal: boolean = false;
  selectedItem: any = null;
  actionReason: string = '';
  modalLoading: boolean = false;

  // Notification Toast
  toastMessage: string = '';
  toastType: 'success' | 'danger' = 'success';
  toastTimeout: any = null;

  constructor(
    private postReportsService: PostReportsService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadReports(1);
  }

  switchTab(tab: 'pending' | 'reviewed' | 'resolved'): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.currentPage = 1;
    this.loadReports(1);
  }

  loadReports(page: number = 1): void {
    this.loading = true;
    this.currentPage = page;

    this.postReportsService.getPostReports(this.activeTab, page, this.perPage).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res && (res.errorcode === '0' || res.errorcode === 0 || res.status === 200 || res.status === '200') && res.data) {
          const paginatedData = res.data;
          this.reports = Array.isArray(paginatedData.data) ? paginatedData.data : (Array.isArray(paginatedData) ? paginatedData : []);
          this.currentPage = paginatedData.current_page || page;
          this.lastPage = paginatedData.last_page || 1;
          this.total = paginatedData.total !== undefined ? paginatedData.total : this.reports.length;
          this.applySearch();
        } else {
          this.reports = [];
          this.filteredReports = [];
          this.total = 0;
        }
      },
      error: (err) => {
        this.loading = false;
        this.reports = [];
        this.filteredReports = [];
        this.total = 0;
        console.error('Error fetching post reports:', err);
      }
    });
  }

  applySearch(): void {
    if (!this.searchTerm || !this.searchTerm.trim()) {
      this.filteredReports = [...this.reports];
      return;
    }

    const term = this.searchTerm.trim().toLowerCase();
    this.filteredReports = this.reports.filter((item) => {
      const postText = (item.post?.content || item.post_content || item.content || '').toLowerCase();
      const ownerName = (item.post?.user?.name || item.post?.owner || item.user?.name || '').toLowerCase();
      const reporterName = (item.user?.name || '').toLowerCase();
      const reasons = (item.reports || []).map((r: any) => r.reason || '').join(' ').toLowerCase();

      return (
        postText.includes(term) ||
        ownerName.includes(term) ||
        reporterName.includes(term) ||
        reasons.includes(term)
      );
    });
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.lastPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.loadReports(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.lastPage) {
      this.loadReports(this.currentPage + 1);
    }
  }

  // --- HIDE POST MODAL ---
  openHideModal(item: any): void {
    this.selectedItem = item;
    this.actionReason = '';
    this.showHideModal = true;
  }

  closeHideModal(): void {
    this.showHideModal = false;
    this.selectedItem = null;
    this.actionReason = '';
    this.modalLoading = false;
  }

  submitHide(): void {
    if (!this.selectedItem) return;
    const postId = this.selectedItem.post?.id || this.selectedItem.post_id || this.selectedItem.id;
    this.modalLoading = true;

    this.postReportsService.hidePost(postId, this.actionReason).subscribe({
      next: (res) => {
        this.modalLoading = false;
        this.closeHideModal();
        this.showToast(this.translate.instant('Post hidden successfully'), 'success');
        this.loadReports(this.currentPage);
      },
      error: (err) => {
        this.modalLoading = false;
        console.error('Error hiding post:', err);
        const errObj = err.error;
        const msg = errObj?.message || this.translate.instant('Failed to hide post');
        this.showToast(msg, 'danger');
      }
    });
  }

  // --- DELETE POST MODAL ---
  openDeleteModal(item: any): void {
    this.selectedItem = item;
    this.actionReason = '';
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedItem = null;
    this.actionReason = '';
    this.modalLoading = false;
  }

  submitDelete(): void {
    if (!this.selectedItem) return;
    const postId = this.selectedItem.post?.id || this.selectedItem.post_id || this.selectedItem.id;
    this.modalLoading = true;

    this.postReportsService.deletePost(postId, this.actionReason).subscribe({
      next: (res) => {
        this.modalLoading = false;
        this.closeDeleteModal();
        this.showToast(this.translate.instant('Post deleted successfully'), 'success');
        this.loadReports(this.currentPage);
      },
      error: (err) => {
        this.modalLoading = false;
        console.error('Error deleting post:', err);
        const errObj = err.error;
        const msg = errObj?.message || this.translate.instant('Failed to delete post');
        this.showToast(msg, 'danger');
      }
    });
  }

  // --- DETAILS MODAL ---
  openDetail(item: any): void {
    this.selectedItem = item;
    this.showDetailModal = true;
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedItem = null;
  }

  // --- TOAST NOTIFICATIONS ---
  showToast(message: string, type: 'success' | 'danger' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = '';
    }, 4000);
  }
}
