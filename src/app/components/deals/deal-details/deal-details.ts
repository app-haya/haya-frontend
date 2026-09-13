import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DealService } from '../../../services/deal.service';
import { NotificationService } from '../../../services/notification.service';
import { DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-deal-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './deal-details.html',
  styleUrls: ['./deal-details.css']
})
export class DealDetails implements OnInit {
  deal: any = null;
  orders: any[] = [];
  loading: boolean = true;
  loadingOrders: boolean = false;

  showInvoiceModal = false;
  safeInvoiceUrl: SafeResourceUrl | null = null;

  // Image & Document preview modal
  showImageModal = false;
  previewImageUrl = '';
  previewSafeUrl: SafeResourceUrl | null = null;
  isPreviewPdf = false;
  previewModalTitle = '';
  rotationAngle = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dealService: DealService,
    private notification: NotificationService,
    private sanitizer: DomSanitizer,
    public translate: TranslateService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    const stateDeal = history.state.deal;
    if (stateDeal) {
      this.deal = stateDeal;
      this.loading = false;
      this.fetchOrders();
    } else {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.notification.error('Deal data lost on refresh. Navigating back...');
        setTimeout(() => {
          window.history.back();
        }, 2000);
      }
    }
  }

  fetchOrders() {
    if (!this.deal || !this.deal.id) return;
    this.loadingOrders = true;
    this.dealService.getDealOrders(this.deal.id).subscribe({
      next: (response) => {
        if (response.errorcode === "0") {
          this.orders = response.data.data;
        }
        this.loadingOrders = false;
      },
      error: () => {
        this.loadingOrders = false;
      }
    });
  }

  approve() {
    this.dealService.approveDeal(this.deal.id).subscribe({
      next: () => {
        this.notification.success('Deal approved successfully');
        this.deal.status = 'approved';
        this.dashboardService.triggerRefresh();
        setTimeout(() => this.router.navigate(['/admin/deals']), 1500);
      }
    });
  }

  reject() {
    const reason = prompt('Please enter the reason for rejection:');
    if (reason && reason.trim()) {
      this.dealService.rejectDeal(this.deal.id, reason).subscribe({
        next: () => {
          this.notification.success('Deal rejected successfully');
          this.deal.status = 'rejected';
          this.dashboardService.triggerRefresh();
          setTimeout(() => this.router.navigate(['/admin/deals']), 1500);
        }
      });
    }
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

  isPdf(url: string): boolean {
    if (!url) return false;
    const clean = url.toLowerCase().split('?')[0].split('#')[0];
    return clean.endsWith('.pdf');
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.formatImageUrl(url));
  }

  getLocalizedName(obj: any): string {
    if (!obj) return '—';
    const currentLang = this.translate.currentLang || 'ar';
    return currentLang === 'ar' ? (obj.name_ar || obj.name_en || '—') : (obj.name_en || obj.name_ar || '—');
  }

  openImageModal(url: string, title: string = '', event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!url) return;
    const formattedUrl = this.formatImageUrl(url);
    this.previewImageUrl = formattedUrl;
    this.isPreviewPdf = this.isPdf(formattedUrl);
    if (this.isPreviewPdf) {
      this.previewSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(formattedUrl);
    } else {
      this.previewSafeUrl = null;
    }
    this.previewModalTitle = title ? (this.translate.instant(title) || title) : '';
    this.rotationAngle = 0;
    this.showImageModal = true;
  }

  openDealImageModal(imgItem: any, index: number): void {
    const url = this.getImageUrl(imgItem);
    const label = this.translate.instant('Deal Image') || 'Deal Image';
    this.openImageModal(url, `${label} #${index + 1}`);
  }

  rotateImage(): void {
    this.rotationAngle = (this.rotationAngle + 90) % 360;
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.previewImageUrl = '';
    this.previewSafeUrl = null;
    this.isPreviewPdf = false;
    this.previewModalTitle = '';
    this.rotationAngle = 0;
  }

  openInvoiceModal(url: string): void {
    this.openImageModal(url, 'Invoice Document');
  }

  closeInvoiceModal(): void {
    this.closeImageModal();
  }

  getImageUrl(item: any): string {
    if (!item) return '';
    if (typeof item === 'string') return item;
    return item.image || item.url || item.path || '';
  }

  getDealImage(order?: any): string {
    if (order?.deal?.images && order.deal.images.length > 0) {
      return this.getImageUrl(order.deal.images[0]);
    }
    if (order?.deal?.image) {
      return order.deal.image;
    }
    if (this.deal?.images && this.deal.images.length > 0) {
      return this.getImageUrl(this.deal.images[0]);
    }
    if (this.deal?.image) {
      return this.deal.image;
    }
    return '';
  }

  getDealDescription(order?: any): string {
    return order?.deal?.description || this.deal?.description || '';
  }

  @HostListener('window:keydown.escape')
  onEscapePress(): void {
    if (this.showImageModal) {
      this.closeImageModal();
    }
  }
}