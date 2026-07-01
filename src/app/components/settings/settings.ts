import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsService } from '../../services/settings.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';
import { ThemeService } from '../../services/theme.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css'],
})
export class Settings implements OnInit {
  settingsForm: FormGroup;
  loading = true;
  submitting = false;
  settingsId: number | null = null;
  activeTab: 'terms' | 'privacy' | 'about' = 'terms';


  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private notification: NotificationService,
    private dialogService: DialogService,
    public themeService: ThemeService
  ) {
    this.settingsForm = this.fb.group({
      privacy_policy_ar: ['', Validators.required],
      privacy_policy_en: ['', Validators.required],
      terms_and_conditions_ar: ['', Validators.required],
      terms_and_conditions_en: ['', Validators.required],
      about_us_ar: ['', Validators.required],
      about_us_en: ['', Validators.required],
      terms_updated_date_ar: [''],
      terms_updated_date_en: [''],
      privacy_updated_date_ar: [''],
      privacy_updated_date_en: [''],
      about_updated_date_ar: [''],
      about_updated_date_en: [''],
    });
  }

  ngOnInit(): void {
    this.fetchSettings();
  }

  get isDarkMode(): boolean {
    return this.themeService.isDark();
  }

  fetchSettings() {
    this.loading = true;
    
    forkJoin({
      general: this.settingsService.getAllSettings().pipe(catchError(() => of(null))),
      terms: this.settingsService.getTerms().pipe(catchError(() => of(null))),
      privacy: this.settingsService.getPrivacy().pipe(catchError(() => of(null))),
      about: this.settingsService.getAboutUs().pipe(catchError(() => of(null)))
    }).subscribe({
      next: (results: any) => {
        let patchData: any = {};

        // 1. Process general record
        if (results.general && results.general.errorcode === '0' && results.general.data) {
          const data = Array.isArray(results.general.data) ? results.general.data[0] : results.general.data;
          if (data) {
            this.settingsId = data.id;
            
            patchData.privacy_policy_ar = data.privacy_policy_ar || data.privacy_ar || '';
            patchData.privacy_policy_en = data.privacy_policy_en || data.privacy_en || '';
            patchData.terms_and_conditions_ar = data.terms_and_conditions_ar || data.terms_ar || '';
            patchData.terms_and_conditions_en = data.terms_and_conditions_en || data.terms_en || '';
            patchData.about_us_ar = data.about_us_ar || data.about_ar || '';
            patchData.about_us_en = data.about_us_en || data.about_en || '';
            patchData.terms_updated_date_ar = data.terms_updated_date_ar || '';
            patchData.terms_updated_date_en = data.terms_updated_date_en || '';
            patchData.privacy_updated_date_ar = data.privacy_updated_date_ar || '';
            patchData.privacy_updated_date_en = data.privacy_updated_date_en || '';
            patchData.about_updated_date_ar = data.about_updated_date_ar || '';
            patchData.about_updated_date_en = data.about_updated_date_en || '';
          }
        }
        
        // 2. Individual fallbacks (only if general fields were empty)
        if (results.terms?.errorcode === '0' && results.terms?.data && typeof results.terms.data === 'string') {
          if (!patchData.terms_and_conditions_ar) patchData.terms_and_conditions_ar = results.terms.data;
        }
        if (results.privacy?.errorcode === '0' && results.privacy?.data && typeof results.privacy.data === 'string') {
          if (!patchData.privacy_policy_ar) patchData.privacy_policy_ar = results.privacy.data;
        }
        if (results.about?.errorcode === '0' && results.about?.data && typeof results.about.data === 'string') {
          if (!patchData.about_us_ar) patchData.about_us_ar = results.about.data;
        }

        this.settingsForm.patchValue(patchData);
        this.loading = false;
        this.adjustTextareas();
      },
      error: () => {
        this.loading = false;
        this.notification.error('Failed to load settings');
      },
    });
  }

  setActiveTab(tab: 'terms' | 'privacy' | 'about') {
    this.activeTab = tab;
    this.adjustTextareas();
  }

  adjustTextareas() {
    setTimeout(() => {
      const textareas = document.querySelectorAll('textarea');
      textareas.forEach((textarea: any) => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      });
    }, 100);
  }

  saveSettings() {
    if (this.settingsForm.invalid) {
      this.notification.error('Please fill all required fields');
      return;
    }

    this.submitting = true;
    const formData = new FormData();
    const values = this.settingsForm.value;
    
    formData.append('privacy_policy_ar', values.privacy_policy_ar);
    formData.append('privacy_policy_en', values.privacy_policy_en);
    formData.append('terms_and_conditions_ar', values.terms_and_conditions_ar);
    formData.append('terms_and_conditions_en', values.terms_and_conditions_en);
    formData.append('about_us_ar', values.about_us_ar);
    formData.append('about_us_en', values.about_us_en);
    formData.append('terms_updated_date_ar', values.terms_updated_date_ar || '');
    formData.append('terms_updated_date_en', values.terms_updated_date_en || '');
    formData.append('privacy_updated_date_ar', values.privacy_updated_date_ar || '');
    formData.append('privacy_updated_date_en', values.privacy_updated_date_en || '');
    formData.append('about_updated_date_ar', values.about_updated_date_ar || '');
    formData.append('about_updated_date_en', values.about_updated_date_en || '');

    if (this.settingsId) {
      formData.append('id', this.settingsId.toString());
    }

    this.settingsService.saveSettings(formData).pipe(
      catchError((err) => of({ errorcode: '1', message: err.error?.message || 'Failed to save settings' }))
    ).subscribe({
      next: (res: any) => {
        if (res && res.errorcode === '0') {
          if (res.data && res.data.id) {
            this.settingsId = res.data.id;
          }
          this.notification.success('Settings saved successfully');
        } else {
          this.notification.error(res?.message || 'Failed to save settings');
        }
        this.submitting = false;
      },
      error: (err) => {
        this.notification.error('Error saving settings');
        this.submitting = false;
      }
    });
  }

  deleteSettings() {
    if (!this.settingsId) return;

    this.dialogService.confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete all settings? this cannot be undone.',
      confirmText: 'DELETE_ALL',
      type: 'danger',
      onConfirm: () => {
        this.settingsService.deleteSettings(this.settingsId!).subscribe({
          next: (res: any) => {
            if (res.errorcode === '0') {
              this.notification.success('Settings deleted successfully');
              this.settingsId = null;
              this.settingsForm.reset();
            } else {
              this.notification.error(res.message || 'Failed to delete settings');
            }
          },
          error: () => this.notification.error('Error deleting settings')
        });
      }
    });
  }
}
