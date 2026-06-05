import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DealService } from '../../../services/deal.service';
import { NotificationService } from '../../../services/notification.service';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dealService: DealService,
    private notification: NotificationService,
    private sanitizer: DomSanitizer
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
    return this.formatImageUrl(url).toLowerCase().endsWith('.pdf');
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.formatImageUrl(url));
  }
}