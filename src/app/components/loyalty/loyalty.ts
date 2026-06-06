import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LoyaltyService } from '../../services/loyalty.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-loyalty',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './loyalty.html',
  styleUrls: ['./loyalty.css']
})
export class Loyalty implements OnInit {
  activeTab: 'packages' | 'merchants' | 'reports' | 'settings' = 'packages';
  activeReportTab: 'purchases' | 'invoices' = 'purchases';
  loading = false;

  // Data lists
  packages: any[] = [];
  merchants: any[] = [];
  purchases: any[] = [];
  invoices: any[] = [];
  settingsData: any = { points_per_riyal: 10, merchant_low_balance_threshold: 10000 };

  // Pagination
  packagesPage = 1;
  packagesLastPage = 1;
  merchantsPage = 1;
  merchantsLastPage = 1;
  purchasesPage = 1;
  purchasesLastPage = 1;
  invoicesPage = 1;
  invoicesLastPage = 1;

  // Package Modal
  showPackageModal = false;
  isEditPackage = false;
  packageForm = { id: 0, name: '', points: 1000, price: 10, currency: 'SAR', is_active: true, sort_order: 99 };
  packageSubmitting = false;

  // Credit Modal
  showCreditModal = false;
  creditForm = { merchantId: 0, merchantName: '', custom_points: 1000, price: 0, currency: 'SAR', note: '' };
  creditSubmitting = false;

  // Merchant Details Modal
  showDetailsModal = false;
  selectedMerchant: any = null;
  merchantLogs: any[] = [];
  merchantInvoicesList: any[] = [];
  logsPage = 1;
  logsLastPage = 1;
  merchantInvoicesPage = 1;
  merchantInvoicesLastPage = 1;
  loadingDetails = false;
  detailsTab: 'invoices' | 'logs' = 'invoices';

  constructor(
    private loyaltyService: LoyaltyService,
    private notification: NotificationService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    if (this.activeTab === 'packages') {
      this.loadPackages(1);
    } else if (this.activeTab === 'merchants') {
      this.loadMerchants(1);
    } else if (this.activeTab === 'reports') {
      this.loadReports();
    } else if (this.activeTab === 'settings') {
      this.loadSettings();
    }
  }

  switchTab(tab: 'packages' | 'merchants' | 'reports' | 'settings'): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.loadData();
  }

  switchReportTab(tab: 'purchases' | 'invoices'): void {
    if (this.activeReportTab === tab) return;
    this.activeReportTab = tab;
    this.loadReports();
  }

  // --- PACKAGES CRUD ---
  loadPackages(page: number = 1): void {
    this.loading = true;
    this.loyaltyService.getPackages(page).subscribe({
      next: (res: any) => {
        if (res.data?.data) {
          this.packages = res.data.data;
          this.packagesPage = res.data.current_page || 1;
          this.packagesLastPage = res.data.last_page || 1;
        } else {
          this.packages = res.data ?? [];
          this.packagesPage = 1;
          this.packagesLastPage = 1;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notification.error('Failed to load loyalty packages');
      }
    });
  }

  openAddPackage(): void {
    this.isEditPackage = false;
    this.packageForm = { id: 0, name: '', points: 5000, price: 50, currency: 'SAR', is_active: true, sort_order: 99 };
    this.showPackageModal = true;
  }

  openEditPackage(pkg: any): void {
    this.isEditPackage = true;
    this.packageForm = {
      id: pkg.id,
      name: pkg.name || '',
      points: pkg.points || 0,
      price: pkg.price || 0,
      currency: pkg.currency || 'SAR',
      is_active: pkg.is_active !== undefined ? pkg.is_active : true,
      sort_order: pkg.sort_order !== undefined ? pkg.sort_order : 99
    };
    this.showPackageModal = true;
  }

  closePackageModal(): void {
    this.showPackageModal = false;
  }

  savePackage(): void {
    if (!this.packageForm.name.trim() || this.packageForm.points <= 0 || this.packageForm.price < 0) {
      this.notification.error('Please fill in all fields correctly');
      return;
    }

    this.packageSubmitting = true;
    if (this.isEditPackage) {
      this.loyaltyService.updatePackage(this.packageForm.id, this.packageForm).subscribe({
        next: () => {
          this.packageSubmitting = false;
          this.notification.success('Package updated successfully');
          this.closePackageModal();
          this.loadPackages(this.packagesPage);
        },
        error: (err) => {
          this.packageSubmitting = false;
          this.notification.error(err?.error?.message || 'Error updating package');
        }
      });
    } else {
      this.loyaltyService.createPackage(this.packageForm).subscribe({
        next: () => {
          this.packageSubmitting = false;
          this.notification.success('Package created successfully');
          this.closePackageModal();
          this.loadPackages(1);
        },
        error: (err) => {
          this.packageSubmitting = false;
          this.notification.error(err?.error?.message || 'Error creating package');
        }
      });
    }
  }

  disablePackage(pkg: any): void {
    this.dialogService.confirm({
      title: 'Confirm Disable',
      message: 'Are you sure you want to disable this package?',
      confirmText: 'Disable',
      type: 'danger',
      onConfirm: () => {
        this.loyaltyService.deletePackage(pkg.id).subscribe({
          next: () => {
            this.notification.success('Package disabled successfully');
            this.loadPackages(this.packagesPage);
          },
          error: (err) => {
            this.notification.error(err?.error?.message || 'Error disabling package');
          }
        });
      }
    });
  }

  // --- MERCHANTS ---
  loadMerchants(page: number = 1): void {
    this.loading = true;
    this.loyaltyService.getMerchants(page).subscribe({
      next: (res: any) => {
        if (res.data?.data) {
          this.merchants = res.data.data;
          this.merchantsPage = res.data.current_page || 1;
          this.merchantsLastPage = res.data.last_page || 1;
        } else {
          this.merchants = res.data ?? [];
          this.merchantsPage = 1;
          this.merchantsLastPage = 1;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notification.error('Failed to load merchants');
      }
    });
  }

  openAddCredit(merchant: any): void {
    this.creditForm = {
      merchantId: merchant.id,
      merchantName: merchant.name || merchant.email || '',
      custom_points: 1000,
      price: 0,
      currency: 'SAR',
      note: ''
    };
    this.showCreditModal = true;
  }

  closeCreditModal(): void {
    this.showCreditModal = false;
  }

  submitCredit(): void {
    if (this.creditForm.custom_points <= 0) {
      this.notification.error('Points must be greater than 0');
      return;
    }
    this.creditSubmitting = true;
    this.loyaltyService.addMerchantCredit(this.creditForm.merchantId, this.creditForm).subscribe({
      next: () => {
        this.creditSubmitting = false;
        this.notification.success('Credit added successfully');
        this.closeCreditModal();
        this.loadMerchants(this.merchantsPage);
      },
      error: (err) => {
        this.creditSubmitting = false;
        this.notification.error(err?.error?.message || 'Error adding credit');
      }
    });
  }

  // --- MERCHANT DETAILS MODAL ---
  viewMerchantDetails(merchant: any): void {
    this.selectedMerchant = merchant;
    this.showDetailsModal = true;
    this.detailsTab = 'invoices';
    this.merchantInvoicesList = [];
    this.merchantLogs = [];
    this.loadMerchantInvoices(1);
    this.loadMerchantLogs(1);
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedMerchant = null;
  }

  loadMerchantInvoices(page: number = 1): void {
    if (!this.selectedMerchant) return;
    this.loadingDetails = true;
    this.loyaltyService.getMerchantInvoices(this.selectedMerchant.id, page).subscribe({
      next: (res: any) => {
        if (res.data?.data) {
          this.merchantInvoicesList = res.data.data;
          this.merchantInvoicesPage = res.data.current_page || 1;
          this.merchantInvoicesLastPage = res.data.last_page || 1;
        } else {
          this.merchantInvoicesList = res.data ?? [];
          this.merchantInvoicesPage = 1;
          this.merchantInvoicesLastPage = 1;
        }
        this.loadingDetails = false;
      },
      error: () => {
        this.loadingDetails = false;
      }
    });
  }

  loadMerchantLogs(page: number = 1): void {
    if (!this.selectedMerchant) return;
    this.loadingDetails = true;
    this.loyaltyService.getMerchantBalanceLogs(this.selectedMerchant.id, page).subscribe({
      next: (res: any) => {
        if (res.data?.data) {
          this.merchantLogs = res.data.data;
          this.logsPage = res.data.current_page || 1;
          this.logsLastPage = res.data.last_page || 1;
        } else {
          this.merchantLogs = res.data ?? [];
          this.logsPage = 1;
          this.logsLastPage = 1;
        }
        this.loadingDetails = false;
      },
      error: () => {
        this.loadingDetails = false;
      }
    });
  }

  // --- REPORTS ---
  loadReports(): void {
    this.loading = true;
    if (this.activeReportTab === 'purchases') {
      this.loyaltyService.getPurchasesReport(this.purchasesPage).subscribe({
        next: (res: any) => {
          if (res.data?.data) {
            this.purchases = res.data.data;
            this.purchasesPage = res.data.current_page || 1;
            this.purchasesLastPage = res.data.last_page || 1;
          } else {
            this.purchases = res.data ?? [];
            this.purchasesPage = 1;
            this.purchasesLastPage = 1;
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.notification.error('Failed to load purchases report');
        }
      });
    } else {
      this.loyaltyService.getInvoicesReport(this.invoicesPage).subscribe({
        next: (res: any) => {
          if (res.data?.data) {
            this.invoices = res.data.data;
            this.invoicesPage = res.data.current_page || 1;
            this.invoicesLastPage = res.data.last_page || 1;
          } else {
            this.invoices = res.data ?? [];
            this.invoicesPage = 1;
            this.invoicesLastPage = 1;
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.notification.error('Failed to load invoices report');
        }
      });
    }
  }

  // --- SETTINGS ---
  loadSettings(): void {
    this.loading = true;
    this.loyaltyService.getSettings().subscribe({
      next: (res: any) => {
        this.settingsData = res.data || res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notification.error('Failed to load settings');
      }
    });
  }

  saveSettings(): void {
    if (this.settingsData.points_per_riyal <= 0 || this.settingsData.merchant_low_balance_threshold < 0) {
      this.notification.error('Please enter valid settings values');
      return;
    }
    this.loading = true;
    this.loyaltyService.updateSettings(this.settingsData).subscribe({
      next: () => {
        this.loading = false;
        this.notification.success('Settings updated successfully');
      },
      error: (err) => {
        this.loading = false;
        this.notification.error(err?.error?.message || 'Error updating settings');
      }
    });
  }

  // --- PAGINATION HELPERS ---
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
