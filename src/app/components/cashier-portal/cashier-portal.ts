import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CashierService } from '../../services/cashier.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';
import { ThemeService } from '../../services/theme.service';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-cashier-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, ConfirmDialog],
  templateUrl: './cashier-portal.html',
  styleUrls: ['./cashier-portal.css']
})
export class CashierPortal implements OnInit {
  cashier: any = null;
  merchant: any = null;
  isDarkMode = false;
  showLangDropdown = false;

  // Customer Lookup state
  lookupPhone: string = '';
  lookupLoading: boolean = false;
  selectedCustomer: any = null;
  lookupError: string = '';

  // Invoice Form state
  invoiceNumber: string = '';
  amount: number | null = null;
  invoiceSubmitting: boolean = false;

  // Invoices list state
  invoices: any[] = [];
  invoicesPage: number = 1;
  invoicesLastPage: number = 1;
  invoicesLoading: boolean = false;

  constructor(
    private cashierService: CashierService,
    private notification: NotificationService,
    private dialogService: DialogService,
    private router: Router,
    public translate: TranslateService,
    private theme: ThemeService
  ) {}

  ngOnInit(): void {
    this.isDarkMode = this.theme.isDark();
    const cachedUser = localStorage.getItem('cashier_user');
    if (cachedUser) {
      this.cashier = JSON.parse(cachedUser);
    }
    this.loadProfile();
    this.loadInvoices(1);
  }

  toggleDropdown() {
    this.showLangDropdown = !this.showLangDropdown;
  }

  changeLang(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    document.body.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    const bsLink = document.getElementById('bootstrap-css') as HTMLLinkElement;
    if (bsLink) {
      bsLink.href = lang === 'ar'
        ? 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css'
        : 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
    }
    this.showLangDropdown = false;
  }

  toggleDarkMode() {
    this.theme.toggle();
    this.isDarkMode = this.theme.isDark();
  }

  loadProfile(): void {
    this.cashierService.getProfile().subscribe({
      next: (res: any) => {
        if (res.data) {
          const profile = res.data;
          this.cashier = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
          };
          if (profile.merchant) {
            this.merchant = {
              id: profile.merchant.user_id,
              name: profile.merchant.name,
              points_balance: profile.merchant.points_balance,
              points_per_riyal: profile.merchant.points_per_riyal || 10,
              low_balance_threshold: profile.merchant.low_balance_threshold || 1000,
            };
          }
          // Update cached user
          localStorage.setItem('cashier_user', JSON.stringify({
            ...this.cashier,
            merchant_name: this.merchant?.name,
            merchant_balance: this.merchant?.points_balance,
            merchant_points_per_riyal: this.merchant?.points_per_riyal,
          }));
        }
      },
      error: (err: any) => {
        this.notification.error(err?.error?.message || 'Failed to load cashier profile');
      }
    });
  }

  loadInvoices(page: number = 1): void {
    this.invoicesLoading = true;
    this.cashierService.getInvoices(page).subscribe({
      next: (res: any) => {
        this.invoicesLoading = false;
        if (res.data) {
          if (res.data.data) {
            this.invoices = res.data.data;
            this.invoicesPage = res.data.current_page || 1;
            this.invoicesLastPage = res.data.last_page || 1;
          } else if (Array.isArray(res.data)) {
            this.invoices = res.data;
            this.invoicesPage = 1;
            this.invoicesLastPage = 1;
          }
        }
      },
      error: () => {
        this.invoicesLoading = false;
        this.notification.error('Failed to load transaction history');
      }
    });
  }

  onLookup(): void {
    if (!this.lookupPhone.trim()) {
      return;
    }
    this.lookupLoading = true;
    this.selectedCustomer = null;
    this.lookupError = '';

    this.cashierService.lookupCustomer(this.lookupPhone.trim()).subscribe({
      next: (res: any) => {
        this.lookupLoading = false;
        if (res.data) {
          this.selectedCustomer = res.data;
        } else {
          this.lookupError = 'Customer Not Found';
        }
      },
      error: (err: any) => {
        this.lookupLoading = false;
        this.selectedCustomer = null;
        if (err.status === 404) {
          this.lookupError = 'Customer Not Found';
        } else {
          this.lookupError = err?.error?.message || 'Error occurred during search';
        }
      }
    });
  }

  get pointsToAward(): number {
    if (!this.amount || this.amount <= 0 || !this.merchant) return 0;
    return Math.round(this.amount * this.merchant.points_per_riyal);
  }

  submitInvoice(): void {
    if (!this.selectedCustomer || !this.invoiceNumber.trim() || !this.amount || this.amount <= 0) {
      this.notification.error('Please fill all invoice details correctly');
      return;
    }

    const pts = this.pointsToAward;
    if (this.merchant && this.merchant.points_balance < pts) {
      this.notification.error('Insufficient points balance for this transaction');
      return;
    }

    this.invoiceSubmitting = true;
    const body = {
      phone: this.lookupPhone.trim(),
      invoice_number: this.invoiceNumber.trim(),
      amount: this.amount
    };

    this.cashierService.createInvoice(body).subscribe({
      next: (res: any) => {
        this.invoiceSubmitting = false;
        this.notification.success('Invoice created successfully');
        
        // Refresh profile to get updated balance
        this.loadProfile();
        // Reload invoices list to show new item
        this.loadInvoices(1);

        // Reset inputs
        this.invoiceNumber = '';
        this.amount = null;
        this.selectedCustomer = null;
        this.lookupPhone = '';
      },
      error: (err: any) => {
        this.invoiceSubmitting = false;
        if (err.status === 409) {
          this.notification.error('Duplicate invoice number');
        } else {
          this.notification.error(err?.error?.message || 'Failed to submit invoice');
        }
      }
    });
  }

  logout(): void {
    this.dialogService.confirm({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      type: 'danger',
      onConfirm: () => {
        this.cashierService.logout().subscribe({
          next: () => {
            this.clearAuthAndRedirect();
          },
          error: () => {
            this.clearAuthAndRedirect();
          }
        });
      }
    });
  }

  private clearAuthAndRedirect(): void {
    localStorage.removeItem('cashier_token');
    localStorage.removeItem('cashier_user');
    this.router.navigate(['/cashier/login']);
  }

  getPageNumbers(current: number, last: number): number[] {
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(last, current + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
