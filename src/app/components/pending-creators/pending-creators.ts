import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { DashboardService } from '../../services/dashboard.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pending-creators',
  templateUrl: './pending-creators.html',
  styleUrls: ['./pending-creators.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule]
})
export class PendingCreators implements OnInit {
  creators: any[] = [];
  filteredCreators: any[] = [];
  loading: boolean = false;
  searchTerm: string = '';
  currentPage = 1;
  lastPage = 1;
  showRejectModal = false;
  rejectReason = '';
  currentRejectId: number | null = null;
  activeTab: 'pending' | 'approved' | 'rejected' = 'pending';
  showDetailModal = false;
  selectedCreator: any = null;

  // Document preview modal
  showDocumentPreview = false;
  previewUrl: string | null = null;
  safePreviewUrl: SafeResourceUrl | null = null;
  previewTitle = '';
  isPdf = false;

  constructor(
    private userService: UsersService,
    private notification: NotificationService,
    private dashboardService: DashboardService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const savedTab = sessionStorage.getItem('verify_creator_tab') as 'pending' | 'approved' | 'rejected';
    if (savedTab) {
      this.activeTab = savedTab;
    }
    this.loadPendingCreators();
  }

  loadPendingCreators(page: number = 1) {
    this.loading = true;
    this.userService.getPendingCreators(page, this.activeTab).subscribe({
      next: (res: any) => {
        const rawData = res.data?.data || [];
        // استبعاد المستخدم العادي وعرض صناع المحتوى فقط
        this.creators = rawData.filter((c: any) => c.verified_method !== 'user');
        this.filteredCreators = [...this.creators];
        this.currentPage = res.data?.current_page || 1;
        this.lastPage = res.data?.last_page || 1;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.loadPendingCreators(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.lastPage) {
      this.loadPendingCreators(this.currentPage + 1);
    }
  }

  goToPage(page: number) {
    this.loadPendingCreators(page);
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.lastPage }, (_, i) => i + 1);
  }

  getPlanLabel(plan: string): string {
    const labels: Record<string, string> = {
      '1month': '1 Month',
      '1year': '1 Year',
      '2years': '2 Years',
      '3years': '3 Years'
    };
    return labels[plan] || plan;
  }

  switchTab(tab: 'pending' | 'approved' | 'rejected'): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    sessionStorage.setItem('verify_creator_tab', tab);
    this.currentPage = 1;
    this.loadPendingCreators(1);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'badge-pending',
      approved: 'badge-approved',
      rejected: 'badge-rejected'
    };
    return map[status] || '';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pending Review',
      approved: 'Approved',
      rejected: 'Rejected'
    };
    return map[status] || status;
  }

  approve(id: number) {
    this.userService.approveCreator(id).subscribe({
      next: () => {
        this.loadPendingCreators(this.currentPage);
        this.notification.success('Approved successfully!');
        this.dashboardService.triggerRefresh();
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Approval failed';
        this.notification.error(msg);
      }
    });
  }

  reject(id: number) {
    this.currentRejectId = id;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  closeRejectModal() {
    this.showRejectModal = false;
    this.currentRejectId = null;
    this.rejectReason = '';
  }

  submitReject() {
    if (this.currentRejectId === null) return;
    this.userService.rejectCreator(this.currentRejectId, this.rejectReason).subscribe({
      next: () => {
        this.loadPendingCreators(this.currentPage);
        this.notification.success('Rejected successfully!');
        this.closeRejectModal();
        this.dashboardService.triggerRefresh();
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Rejection failed';
        this.notification.error(msg);
      }
    });
  }

  search() {
    const term = this.searchTerm.toLowerCase();
    this.filteredCreators = this.creators.filter(c =>
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  }

  openDetail(creator: any): void {
    this.selectedCreator = creator;
    this.showDetailModal = true;
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedCreator = null;
  }

  showEditLinksModal = false;
  currentEditCreator: any = null;
  editLink1 = '';
  editLink2 = '';
  savingLinks = false;

  openEditLinksModal(creator: any): void {
    this.currentEditCreator = creator;
    this.editLink1 = creator.creator_verified_link || '';
    this.editLink2 = creator.creator_verified_link_2 || '';
    this.showEditLinksModal = true;
  }

  closeEditLinksModal(): void {
    this.showEditLinksModal = false;
    this.currentEditCreator = null;
    this.editLink1 = '';
    this.editLink2 = '';
    this.savingLinks = false;
  }

  submitEditLinks(): void {
    if (!this.currentEditCreator) return;
    this.savingLinks = true;
    this.userService.updateCreatorLinks(this.currentEditCreator.id, this.editLink1, this.editLink2).subscribe({
      next: (res: any) => {
        const updated1 = res.data?.creator_verified_link ?? this.editLink1;
        const updated2 = res.data?.creator_verified_link_2 ?? this.editLink2;
        this.currentEditCreator.creator_verified_link = updated1;
        this.currentEditCreator.creator_verified_link_2 = updated2;
        if (this.selectedCreator && this.selectedCreator.id === this.currentEditCreator.id) {
          this.selectedCreator.creator_verified_link = updated1;
          this.selectedCreator.creator_verified_link_2 = updated2;
        }
        this.notification.success('Links updated successfully!');
        this.closeEditLinksModal();
      },
      error: (err: any) => {
        this.savingLinks = false;
        const msg = err?.error?.message || 'Failed to update links';
        this.notification.error(msg);
      }
    });
  }

  previewDocument(url: string | null | undefined, title: string = 'Document'): void {
    if (!url) return;
    this.previewUrl = url;
    this.previewTitle = title;
    this.isPdf = url.toLowerCase().includes('.pdf');
    this.safePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.showDocumentPreview = true;
  }

  closeDocumentPreview(): void {
    this.showDocumentPreview = false;
    this.previewUrl = null;
    this.safePreviewUrl = null;
    this.previewTitle = '';
    this.isPdf = false;
  }
}