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

declare var ClassicEditor: any;

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
  editors: { [key: string]: any } = {};

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
            
            patchData.privacy_policy_ar = this.autoFormatSpacing(data.privacy_policy_ar || data.privacy_ar || '');
            patchData.privacy_policy_en = this.autoFormatSpacing(data.privacy_policy_en || data.privacy_en || '');
            patchData.terms_and_conditions_ar = this.autoFormatSpacing(data.terms_and_conditions_ar || data.terms_ar || '');
            patchData.terms_and_conditions_en = this.autoFormatSpacing(data.terms_and_conditions_en || data.terms_en || '');
            patchData.about_us_ar = this.autoFormatSpacing(data.about_us_ar || data.about_ar || '');
            patchData.about_us_en = this.autoFormatSpacing(data.about_us_en || data.about_en || '');
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
          if (!patchData.terms_and_conditions_ar) patchData.terms_and_conditions_ar = this.autoFormatSpacing(results.terms.data);
        }
        if (results.privacy?.errorcode === '0' && results.privacy?.data && typeof results.privacy.data === 'string') {
          if (!patchData.privacy_policy_ar) patchData.privacy_policy_ar = this.autoFormatSpacing(results.privacy.data);
        }
        if (results.about?.errorcode === '0' && results.about?.data && typeof results.about.data === 'string') {
          if (!patchData.about_us_ar) patchData.about_us_ar = this.autoFormatSpacing(results.about.data);
        }

        this.settingsForm.patchValue(patchData);
        this.loading = false;
        this.adjustTextareas();
        this.initCKEditorForTab(this.activeTab);
      },
      error: () => {
        this.loading = false;
        this.notification.error('Failed to load settings');
      },
    });
  }

  autoFormatSpacing(text: string): string {
    if (!text) return '';
    let formatted = text;

    // 1. Separate headings (# Heading) with double newlines
    formatted = formatted.replace(/(?:^|[^\n])\s*(?:---|--)?\s*(#+\s*[^#\n]+)/gi, '\n\n$1');

    // 2. Separate bullet points (* Bullet or • Bullet) with a newline
    formatted = formatted.replace(/(?:^|[^\n])\s*([\*•]\s*)/g, '\n$1');

    // 3. Separate parameters like "البرامتر:" or "مسار " onto newlines
    formatted = formatted.replace(/([^\n])\s*(البرامتر:|مسار\s+)/g, '$1\n$2');

    // 4. Remove excessive blank lines
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    return formatted.trim();
  }

  formatTextSpacing() {
    const val = this.settingsForm.value;
    const formattedVals = {
      privacy_policy_ar: this.autoFormatSpacing(val.privacy_policy_ar),
      privacy_policy_en: this.autoFormatSpacing(val.privacy_policy_en),
      terms_and_conditions_ar: this.autoFormatSpacing(val.terms_and_conditions_ar),
      terms_and_conditions_en: this.autoFormatSpacing(val.terms_and_conditions_en),
      about_us_ar: this.autoFormatSpacing(val.about_us_ar),
      about_us_en: this.autoFormatSpacing(val.about_us_en),
    };

    this.settingsForm.patchValue(formattedVals);

    // Sync active CKEditor instances with formatted values
    Object.keys(this.editors).forEach(id => {
      if (this.editors[id]) {
        let key = '';
        if (id === 'terms_ar_editor') key = 'terms_and_conditions_ar';
        if (id === 'terms_en_editor') key = 'terms_and_conditions_en';
        if (id === 'privacy_ar_editor') key = 'privacy_policy_ar';
        if (id === 'privacy_en_editor') key = 'privacy_policy_en';
        if (id === 'about_ar_editor') key = 'about_us_ar';
        if (id === 'about_en_editor') key = 'about_us_en';

        if (key && formattedVals[key as keyof typeof formattedVals]) {
          this.editors[id].setData(formattedVals[key as keyof typeof formattedVals]);
        }
      }
    });

    this.adjustTextareas();
    this.notification.success('تم تنسيق المسافات بين الفقرات والعناوين بنجاح');
  }

  setActiveTab(tab: 'terms' | 'privacy' | 'about') {
    this.activeTab = tab;
    this.adjustTextareas();
    this.initCKEditorForTab(tab);
  }

  initCKEditorForTab(tab: 'terms' | 'privacy' | 'about') {
    setTimeout(() => {
      if (typeof ClassicEditor === 'undefined') return;

      let fields: { id: string, name: string }[] = [];
      if (tab === 'terms') {
        fields = [
          { id: 'terms_ar_editor', name: 'terms_and_conditions_ar' },
          { id: 'terms_en_editor', name: 'terms_and_conditions_en' }
        ];
      } else if (tab === 'privacy') {
        fields = [
          { id: 'privacy_ar_editor', name: 'privacy_policy_ar' },
          { id: 'privacy_en_editor', name: 'privacy_policy_en' }
        ];
      } else if (tab === 'about') {
        fields = [
          { id: 'about_ar_editor', name: 'about_us_ar' },
          { id: 'about_en_editor', name: 'about_us_en' }
        ];
      }

      fields.forEach(field => {
        const el = document.getElementById(field.id);
        if (el && !this.editors[field.id]) {
          ClassicEditor.create(el, {
            toolbar: [
              'heading', '|',
              'bold', 'italic', '|',
              'bulletedList', 'numberedList', '|',
              'blockQuote', 'undo', 'redo'
            ]
          }).then((editor: any) => {
            this.editors[field.id] = editor;
            const currentVal = this.settingsForm.get(field.name)?.value || '';
            if (currentVal) {
              editor.setData(currentVal);
            }
            editor.model.document.on('change:data', () => {
              const data = editor.getData();
              if (data || !currentVal) {
                this.settingsForm.get(field.name)?.setValue(data, { emitEvent: false });
              }
            });
          }).catch((err: any) => console.error('CKEditor init error:', err));
        }
      });
    }, 150);
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
    // Sync all active CKEditor instances before submit
    Object.keys(this.editors).forEach(id => {
      if (this.editors[id]) {
        const data = this.editors[id].getData();
        if (id === 'terms_ar_editor' && data) this.settingsForm.get('terms_and_conditions_ar')?.setValue(data);
        if (id === 'terms_en_editor' && data) this.settingsForm.get('terms_and_conditions_en')?.setValue(data);
        if (id === 'privacy_ar_editor' && data) this.settingsForm.get('privacy_policy_ar')?.setValue(data);
        if (id === 'privacy_en_editor' && data) this.settingsForm.get('privacy_policy_en')?.setValue(data);
        if (id === 'about_ar_editor' && data) this.settingsForm.get('about_us_ar')?.setValue(data);
        if (id === 'about_en_editor' && data) this.settingsForm.get('about_us_en')?.setValue(data);
      }
    });

    const values = this.settingsForm.value;

    // Auto-fill any missing required fields with fallback to prevent validation failure
    const privacyAr = values.privacy_policy_ar || values.terms_and_conditions_ar || 'سياسة الخصوصية';
    const privacyEn = values.privacy_policy_en || values.terms_and_conditions_en || values.privacy_policy_ar || 'Privacy Policy';
    const termsAr = values.terms_and_conditions_ar || values.privacy_policy_ar || 'الشروط والأحكام';
    const termsEn = values.terms_and_conditions_en || values.privacy_policy_en || values.terms_and_conditions_ar || 'Terms and Conditions';
    const aboutAr = values.about_us_ar || 'من نحن';
    const aboutEn = values.about_us_en || values.about_us_ar || 'About Us';

    this.settingsForm.patchValue({
      privacy_policy_ar: privacyAr,
      privacy_policy_en: privacyEn,
      terms_and_conditions_ar: termsAr,
      terms_and_conditions_en: termsEn,
      about_us_ar: aboutAr,
      about_us_en: aboutEn
    });

    if (this.settingsForm.invalid) {
      this.notification.error('Please fill all required fields');
      return;
    }

    this.submitting = true;
    const formData = new FormData();
    const finalValues = this.settingsForm.value;
    
    formData.append('privacy_policy_ar', finalValues.privacy_policy_ar);
    formData.append('privacy_policy_en', finalValues.privacy_policy_en);
    formData.append('terms_and_conditions_ar', finalValues.terms_and_conditions_ar);
    formData.append('terms_and_conditions_en', finalValues.terms_and_conditions_en);
    formData.append('about_us_ar', finalValues.about_us_ar);
    formData.append('about_us_en', finalValues.about_us_en);
    formData.append('terms_updated_date_ar', finalValues.terms_updated_date_ar || '');
    formData.append('terms_updated_date_en', finalValues.terms_updated_date_en || '');
    formData.append('privacy_updated_date_ar', finalValues.privacy_updated_date_ar || '');
    formData.append('privacy_updated_date_en', finalValues.privacy_updated_date_en || '');
    formData.append('about_updated_date_ar', finalValues.about_updated_date_ar || '');
    formData.append('about_updated_date_en', finalValues.about_updated_date_en || '');

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
