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
  selector: 'app-deal-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './deal-orders.html',
  styleUrls: ['./deal-orders.css']
})
export class DealOrders implements OnInit {
  orders: any[] = [];
  loading = false;
  searchTerm = '';
  currentPage = 1;
  lastPage = 1;
  total = 0;
  perPage = 20;
  orderStatusFilter = '';

  showInvoiceModal = false;
  safeInvoiceUrl: SafeResourceUrl | null = null;

  constructor(
    private dealService: DealService,
    private notification: NotificationService,
    public translate: TranslateService,
    private dashboardService: DashboardService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(page: number = 1): void {
    this.loading = true;
    this.orders = [];

    this.dealService.getAllDealOrders(page, this.orderStatusFilter, this.searchTerm).subscribe({
      next: (res: any) => {
        if (res.data?.data) {
          this.orders = res.data.data;
          this.currentPage = res.data.current_page;
          this.lastPage = res.data.last_page;
          this.total = res.data.total;
        } else {
          this.orders = res.data ?? [];
          this.currentPage = 1;
          this.lastPage = 1;
          this.total = this.orders.length;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notification.error('Failed to load orders');
      }
    });
  }

  search(): void {
    this.currentPage = 1;
    this.loadOrders(1);
  }

  onOrderStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadOrders(1);
  }

  formatImageUrl(url: string): string {
    if (!url) return '';
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
    
    if (cleanPath.startsWith('storage/')) {
      return `https://hayaapp.online/${cleanPath}`;
    }
    if (cleanPath.startsWith('uploads/') || cleanPath.startsWith('deals_files/')) {
      return `https://hayaapp.online/storage/${cleanPath}`;
    }
    
    return `https://hayaapp.online/storage/${cleanPath}`;
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.loadOrders(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.lastPage) {
      this.loadOrders(this.currentPage + 1);
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

  openInvoiceModal(url: string): void {
    this.safeInvoiceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.formatImageUrl(url));
    this.showInvoiceModal = true;
  }

  closeInvoiceModal(): void {
    this.showInvoiceModal = false;
    this.safeInvoiceUrl = null;
  }
}
