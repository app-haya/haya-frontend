import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsService } from '../../services/settings.service';
import { NotificationService } from '../../services/notification.service';
import { ThemeService } from '../../services/theme.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-verification-prices',
  templateUrl: './verification-prices.html',
  styleUrls: ['./verification-prices.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule]
})
export class VerificationPrices implements OnInit {
  plans: any[] = [];
  loading = false;
  savingPlan = false;
  deletingPlanId: number | null = null;
  togglingPlanId: number | null = null;

  // Form states
  showForm = false;
  isEditing = false;
  formId: number | null = null;
  formPlanKey = '';
  formLabelAr = '';
  formLabelEn = '';
  formPrice = 0;
  formDurationValue = 1;
  formDurationUnit = 'month';
  formIsActive = true;

  constructor(
    private settingsService: SettingsService,
    private notification: NotificationService,
    public themeService: ThemeService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  get isDarkMode(): boolean {
    return this.themeService.isDark();
  }

  loadPlans(): void {
    this.loading = true;
    this.settingsService.getVerificationPlans().subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res && res.errorcode === '0' && res.data) {
          this.plans = res.data;
        }
      },
      error: () => {
        this.loading = false;
        this.notification.error('Failed to load verification plans');
      }
    });
  }

  openAddForm(): void {
    this.isEditing = false;
    this.formId = null;
    this.formPlanKey = '';
    this.formLabelAr = '';
    this.formLabelEn = '';
    this.formPrice = 0;
    this.formDurationValue = 1;
    this.formDurationUnit = 'month';
    this.formIsActive = true;
    this.showForm = true;
  }

  openEditForm(plan: any): void {
    this.isEditing = true;
    this.formId = plan.id;
    this.formPlanKey = plan.plan_key;
    this.formLabelAr = plan.label_ar;
    this.formLabelEn = plan.label_en;
    this.formPrice = parseFloat(plan.price);
    this.formDurationValue = plan.duration_value;
    this.formDurationUnit = plan.duration_unit;
    this.formIsActive = plan.is_active;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  savePlan(): void {
    if (!this.formPlanKey || !this.formLabelAr || !this.formLabelEn || this.formPrice === null || this.formPrice === undefined) {
      this.notification.error('Please fill all required fields');
      return;
    }

    this.savingPlan = true;
    const data: any = {
      plan_key: this.formPlanKey,
      label_ar: this.formLabelAr,
      label_en: this.formLabelEn,
      price: this.formPrice,
      duration_value: this.formDurationValue,
      duration_unit: this.formDurationUnit,
      is_active: this.formIsActive
    };

    if (this.formId) {
      data.id = this.formId;
    }

    this.settingsService.saveVerificationPlan(data).subscribe({
      next: (res: any) => {
        this.savingPlan = false;
        if (res && res.errorcode === '0') {
          this.notification.success('Verification plan saved successfully!');
          this.showForm = false;
          this.loadPlans();
        } else {
          this.notification.error(res.message || 'Failed to save verification plan');
        }
      },
      error: (err: any) => {
        this.savingPlan = false;
        const msg = err.error?.message || 'Failed to save verification plan';
        this.notification.error(msg);
      }
    });
  }

  deletePlan(id: number): void {
    this.dialogService.confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this plan?',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: () => {
        this.deletingPlanId = id;
        this.settingsService.deleteVerificationPlan(id).subscribe({
          next: (res: any) => {
            this.deletingPlanId = null;
            if (res && res.errorcode === '0') {
              this.notification.success('Verification plan deleted successfully!');
              this.loadPlans();
            } else {
              this.notification.error(res.message || 'Failed to delete verification plan');
            }
          },
          error: () => {
            this.deletingPlanId = null;
            this.notification.error('Failed to delete verification plan');
          }
        });
      }
    });
  }

  togglePlan(id: number): void {
    this.togglingPlanId = id;
    this.settingsService.toggleVerificationPlan(id).subscribe({
      next: (res: any) => {
        this.togglingPlanId = null;
        if (res && res.errorcode === '0') {
          this.notification.success('Verification plan status updated successfully!');
          this.loadPlans();
        } else {
          this.notification.error(res.message || 'Failed to update plan status');
        }
      },
      error: () => {
        this.togglingPlanId = null;
        this.notification.error('Failed to update plan status');
      }
    });
  }
}
