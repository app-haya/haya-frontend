import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { VerificationOrdersService } from '../../services/verification-orders.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-verification-orders',
  templateUrl: './verification-orders.html',
  styleUrls: ['./verification-orders.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule]
})
export class VerificationOrders implements OnInit {
  orders: any[] = [];
  loading = false;
  activeTab: 'pending_review' | 'approved' | 'rejected' = 'pending_review';

  currentPage = 1;
  lastPage = 1;
  total = 0;
  perPage = 20;

  // Reject modal
  showRejectModal = false;
  rejectReason = '';
  rejectAttachment: File | null = null;
  rejectAttachmentName = '';
  currentRejectId: number | null = null;
  rejectLoading = false;
  attachmentError = '';

  // Detail modal
  showDetailModal = false;
  selectedOrder: any = null;

  // Approve loading state per order
  approvingId: number | null = null;

  constructor(
    private svc: VerificationOrdersService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(page: number = 1): void {
    this.loading = true;
    this.orders = [];
    this.svc.getOrders(this.activeTab, page, this.perPage).subscribe({
      next: (res: any) => {
        const d = res.data;
        this.orders = d.data;
        this.currentPage = d.current_page;
        this.lastPage = d.last_page;
        this.total = d.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notification.error('Failed to load orders');
      }
    });
  }

  switchTab(tab: 'pending_review' | 'approved' | 'rejected'): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.currentPage = 1;
    this.loadOrders(1);
  }

  prevPage(): void {
    if (this.currentPage > 1) this.loadOrders(this.currentPage - 1);
  }

  nextPage(): void {
    if (this.currentPage < this.lastPage) this.loadOrders(this.currentPage + 1);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.lastPage, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  approve(id: number): void {
    this.approvingId = id;
    this.svc.approveOrder(id).subscribe({
      next: () => {
        this.approvingId = null;
        this.notification.success('Order approved successfully!');
        this.loadOrders(this.currentPage);
      },
      error: (err: any) => {
        this.approvingId = null;
        const msg = err?.error?.message || 'Approval failed';
        this.notification.error(msg);
      }
    });
  }

  openRejectModal(id: number): void {
    this.currentRejectId = id;
    this.rejectReason = '';
    this.rejectAttachment = null;
    this.rejectAttachmentName = '';
    this.attachmentError = '';
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.currentRejectId = null;
    this.rejectLoading = false;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      this.attachmentError = 'Only JPG, PNG, WEBP, PDF files are allowed';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.attachmentError = 'File must be under 5MB';
      return;
    }
    this.attachmentError = '';
    this.rejectAttachment = file;
    this.rejectAttachmentName = file.name;
  }

  clearAttachment(): void {
    this.rejectAttachment = null;
    this.rejectAttachmentName = '';
    this.attachmentError = '';
  }

  submitReject(): void {
    if (this.currentRejectId === null || this.attachmentError) return;
    this.rejectLoading = true;
    this.svc.rejectOrder(
      this.currentRejectId,
      this.rejectReason || undefined,
      this.rejectAttachment || undefined
    ).subscribe({
      next: () => {
        this.rejectLoading = false;
        this.notification.success('Order rejected successfully!');
        this.closeRejectModal();
        this.loadOrders(this.currentPage);
      },
      error: (err: any) => {
        this.rejectLoading = false;
        const msg = err?.error?.message || 'Rejection failed';
        this.notification.error(msg);
      }
    });
  }

  openDetail(order: any): void {
    this.selectedOrder = order;
    this.showDetailModal = true;
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedOrder = null;
  }

  getPlanLabel(plan: string): string {
    const labels: Record<string, string> = {
      '1year': 'سنة واحدة',
      '2years': 'سنتان',
      '3years': '3 سنوات'
    };
    return labels[plan] || plan;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending_review: 'badge-pending',
      approved: 'badge-approved',
      rejected: 'badge-rejected'
    };
    return map[status] || '';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending_review: 'قيد المراجعة',
      approved: 'مقبول',
      rejected: 'مرفوض'
    };
    return map[status] || status;
  }
}
