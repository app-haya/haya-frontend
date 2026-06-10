import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsService } from '../../services/settings.service';
import { NotificationService } from '../../services/notification.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-verification-prices',
  templateUrl: './verification-prices.html',
  styleUrls: ['./verification-prices.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule]
})
export class VerificationPrices implements OnInit {
  price1Year = 0;
  price2Years = 0;
  price3Year = 0;
  loading = false;
  savingPrices = false;

  constructor(
    private settingsService: SettingsService,
    private notification: NotificationService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadPrices();
  }

  get isDarkMode(): boolean {
    return this.themeService.isDark();
  }

  loadPrices(): void {
    this.loading = true;
    this.settingsService.getVerificationPrices().subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res && res.errorcode === '0' && res.data) {
          this.price1Year = res.data.price_1year;
          this.price2Years = res.data.price_2years;
          this.price3Year = res.data.price_3years;
        }
      },
      error: () => {
        this.loading = false;
        this.notification.error('Failed to load verification plan prices');
      }
    });
  }

  savePrices(): void {
    this.savingPrices = true;
    const data = {
      price_1year: this.price1Year,
      price_2years: this.price2Years,
      price_3years: this.price3Year
    };
    this.settingsService.updateVerificationPrices(data).subscribe({
      next: (res: any) => {
        this.savingPrices = false;
        if (res && res.errorcode === '0') {
          this.notification.success('Verification plan prices updated successfully!');
        } else {
          this.notification.error(res.message || 'Failed to update verification plan prices');
        }
      },
      error: () => {
        this.savingPrices = false;
        this.notification.error('Failed to update verification plan prices');
      }
    });
  }
}
