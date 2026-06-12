import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';import { UsersService } from '../../services/users.service';import { CommonModule } from '@angular/common';import { FormsModule } from '@angular/forms';import { NotificationService } from '../../services/notification.service';import { DashboardService } from '../../services/dashboard.service';@Component({  selector: 'app-pending-creators',  templateUrl: './pending-creators.html',  styleUrls: ['./pending-creators.css'],  standalone: true,  imports: [CommonModule, FormsModule, TranslateModule]})export class PendingCreators implements OnInit {
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

  constructor(
    private userService: UsersService,
    private notification: NotificationService,
    private dashboardService: DashboardService
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
        this.creators = res.data.data;
        this.filteredCreators = [...this.creators];
        this.currentPage = res.data.current_page;
        this.lastPage = res.data.last_page;
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
    this.userService.approveCreator(id).subscribe(() => {
      this.loadPendingCreators(this.currentPage);
      this.notification.success('Approved successfully!');
      this.dashboardService.triggerRefresh();
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
    this.userService.rejectCreator(this.currentRejectId, this.rejectReason).subscribe(() => {
      this.loadPendingCreators(this.currentPage);
      this.notification.success('Rejected successfully!');
      this.closeRejectModal();
      this.dashboardService.triggerRefresh();
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
}