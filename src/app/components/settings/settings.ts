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

export interface SectionItem {
  id: string;
  title: string;
  content: string;
}

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
  editorMode: 'builder' | 'raw' = 'builder';
  editors: { [key: string]: any } = {};

  sections: {
    terms: { ar: SectionItem[]; en: SectionItem[] };
    privacy: { ar: SectionItem[]; en: SectionItem[] };
    about: { ar: SectionItem[]; en: SectionItem[] };
  } = {
    terms: { ar: [], en: [] },
    privacy: { ar: [], en: [] },
    about: { ar: [], en: [] },
  };

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
        this.parseAllSectionsFromForm();
        this.loading = false;
        this.adjustTextareas();
        if (this.editorMode === 'raw') {
          this.initCKEditorForTab(this.activeTab);
        }
      },
      error: () => {
        this.loading = false;
        this.notification.error('Failed to load settings');
      },
    });
  }

  autoFormatSpacing(text: string): string {
    if (!text) return '';

    // If it's already HTML (contains <h3>, <p>, <ul>), clean any remaining stray # in <p>
    if (/<(h[1-6]|ul|ol|li|blockquote)\b[^>]*>/i.test(text)) {
      let cleaned = text.replace(/<p>\s*#+\s*(.*?)\s*<\/p>/gi, '<h3>$1</h3>');
      return cleaned.trim();
    }

    let raw = text;
    // 1. Separate inline `# Heading` or `#Heading` into newlines
    raw = raw.replace(/(?:^|[^\n])\s*(#+\s*[^#\n]+)/g, '\n\n$1\n\n');
    // 2. Separate bullet points (* Bullet or • Bullet) with a newline
    raw = raw.replace(/(?:^|[^\n])\s*([\*•]\s*)/g, '\n$1');

    const lines = raw.split('\n');
    let htmlOutput: string[] = [];
    let inList = false;

    for (let line of lines) {
      let trimmed = line.trim();
      if (!trimmed) {
        if (inList) {
          htmlOutput.push('</ul>');
          inList = false;
        }
        continue;
      }

      // Markdown Header (# Header)
      if (/^#+\s*(.+)$/.test(trimmed)) {
        if (inList) {
          htmlOutput.push('</ul>');
          inList = false;
        }
        const headingText = trimmed.replace(/^#+\s*/, '').trim();
        htmlOutput.push(`<h3>${headingText}</h3>`);
        continue;
      }

      // Bullet List (* Item or • Item or - Item)
      if (/^[\*\-•]\s*(.+)$/.test(trimmed)) {
        if (!inList) {
          htmlOutput.push('<ul>');
          inList = true;
        }
        const itemText = trimmed.replace(/^[\*\-•]\s*/, '').trim();
        htmlOutput.push(`<li>${itemText}</li>`);
        continue;
      }

      if (inList) {
        htmlOutput.push('</ul>');
        inList = false;
      }

      htmlOutput.push(`<p>${trimmed}</p>`);
    }

    if (inList) {
      htmlOutput.push('</ul>');
    }

    return htmlOutput.join('');
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
              const formattedHtml = this.autoFormatSpacing(currentVal);
              this.settingsForm.get(field.name)?.setValue(formattedHtml, { emitEvent: false });
              editor.setData(formattedHtml);
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

  // --- SECTION BUILDER METHODS ---
  toggleEditorMode(mode: 'builder' | 'raw') {
    if (this.editorMode === mode) return;
    this.editorMode = mode;
    if (mode === 'builder') {
      this.parseAllSectionsFromForm();
    } else {
      this.initCKEditorForTab(this.activeTab);
    }
  }

  parseAllSectionsFromForm() {
    const val = this.settingsForm.value;
    this.sections.terms.ar = this.parseTextToSections(val.terms_and_conditions_ar);
    this.sections.terms.en = this.parseTextToSections(val.terms_and_conditions_en);
    this.sections.privacy.ar = this.parseTextToSections(val.privacy_policy_ar);
    this.sections.privacy.en = this.parseTextToSections(val.privacy_policy_en);
    this.sections.about.ar = this.parseTextToSections(val.about_us_ar);
    this.sections.about.en = this.parseTextToSections(val.about_us_en);

    // Provide default empty item if empty
    (['terms', 'privacy', 'about'] as const).forEach(tab => {
      (['ar', 'en'] as const).forEach(lang => {
        if (this.sections[tab][lang].length === 0) {
          this.sections[tab][lang].push({ id: this.generateId(), title: '', content: '' });
        }
      });
    });
  }

  parseTextToSections(htmlOrText: string): SectionItem[] {
    if (!htmlOrText || !htmlOrText.trim()) return [];

    const items: SectionItem[] = [];

    // Check for HTML headings <h1>-<h6>
    if (/<h[1-6]\b[^>]*>/i.test(htmlOrText)) {
      const headingRegex = /<h[1-6]\b[^>]*>(.*?)<\/h[1-6]>/gi;
      let match: RegExpExecArray | null;
      const matches: { title: string; index: number; length: number }[] = [];

      while ((match = headingRegex.exec(htmlOrText)) !== null) {
        matches.push({
          title: match[1].replace(/<[^>]*>/g, '').trim(),
          index: match.index,
          length: match[0].length,
        });
      }

      if (matches.length > 0) {
        if (matches[0].index > 0) {
          const prefixText = this.cleanHtmlToPlainText(htmlOrText.substring(0, matches[0].index));
          if (prefixText) {
            items.push({ id: this.generateId(), title: 'المقدمة', content: prefixText });
          }
        }

        for (let i = 0; i < matches.length; i++) {
          const m = matches[i];
          const startContent = m.index + m.length;
          const endContent = i < matches.length - 1 ? matches[i + 1].index : htmlOrText.length;
          const cleanContent = this.cleanHtmlToPlainText(htmlOrText.substring(startContent, endContent));

          const normalized = this.normalizeSectionTitleAndContent(m.title, cleanContent);

          items.push({
            id: this.generateId(),
            title: normalized.title,
            content: normalized.content,
          });
        }
        return items;
      }
    }

    // Markdown or plain text
    const raw = htmlOrText.replace(/\\n/g, '\n').replace(/\r\n|\r/g, '\n');
    const lines = raw.split('\n');

    let currentTitle = '';
    let currentLines: string[] = [];

    for (let line of lines) {
      let trimmed = line.trim();
      if (!trimmed) continue;

      if (/^#+\s*(.+)$/.test(trimmed)) {
        if (currentTitle || currentLines.length > 0) {
          const normalized = this.normalizeSectionTitleAndContent(currentTitle, currentLines.join('\n'));
          items.push({
            id: this.generateId(),
            title: normalized.title,
            content: normalized.content,
          });
          currentLines = [];
        }
        currentTitle = trimmed.replace(/^#+\s*/, '').trim();
      } else {
        currentLines.push(trimmed);
      }
    }

    if (currentTitle || currentLines.length > 0) {
      const normalized = this.normalizeSectionTitleAndContent(currentTitle, currentLines.join('\n'));
      items.push({
        id: this.generateId(),
        title: normalized.title,
        content: normalized.content,
      });
    }

    return items;
  }

  normalizeSectionTitleAndContent(rawTitle: string, rawContent: string): { title: string; content: string } {
    let title = (rawTitle || '').trim();
    let content = (rawContent || '').trim();

    // If title is excessively long or contains multiple sentences/phrases
    if (title.length > 60 || (title.length > 35 && (title.includes('.') || title.includes('!') || title.includes('?')))) {
      let breakIdx = -1;
      const match = title.match(/[:\.\!\?\n]/);
      if (match && match.index !== undefined && match.index > 3 && match.index < 60) {
        breakIdx = match.index + (match[0] === ':' ? 1 : 0);
      } else if (title.length > 50) {
        const lastSpace = title.substring(0, 50).lastIndexOf(' ');
        if (lastSpace > 10) {
          breakIdx = lastSpace;
        }
      }

      if (breakIdx > 0) {
        const extractedTitle = title.substring(0, breakIdx).trim().replace(/^[\.\:\!\?]+/, '');
        const extractedContent = title.substring(breakIdx).trim().replace(/^[\.\:\!\?]+/, '').trim();

        title = extractedTitle;
        if (extractedContent) {
          content = content ? extractedContent + '\n\n' + content : extractedContent;
        }
      }
    }

    return { title, content };
  }

  cleanHtmlToPlainText(html: string): string {
    if (!html) return '';
    let text = html.replace(/<li\b[^>]*>(.*?)<\/li>/gi, '• $1\n');
    text = text.replace(/<p\b[^>]*>(.*?)<\/p>/gi, '$1\n');
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<[^>]*>/g, '');
    text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    text = text.replace(/\n{3,}/g, '\n\n');
    return text.trim();
  }

  generateHtmlFromSections(items: SectionItem[]): string {
    if (!items || items.length === 0) return '';

    let htmlParts: string[] = [];

    for (let item of items) {
      const normalized = this.normalizeSectionTitleAndContent(item.title, item.content);
      const title = (normalized.title || '').trim();
      const content = (normalized.content || '').trim();

      if (!title && !content) continue;

      if (title) {
        htmlParts.push(`<h3>${title}</h3>`);
      }

      if (content) {
        const lines = content.split('\n');
        let inList = false;

        for (let line of lines) {
          let trimmed = line.trim();
          if (!trimmed) {
            if (inList) {
              htmlParts.push('</ul>');
              inList = false;
            }
            continue;
          }

          if (/^[\*\-•]\s*(.+)$/.test(trimmed)) {
            if (!inList) {
              htmlParts.push('<ul>');
              inList = true;
            }
            const itemText = trimmed.replace(/^[\*\-•]\s*/, '').trim();
            htmlParts.push(`<li>${itemText}</li>`);
            continue;
          }

          if (inList) {
            htmlParts.push('</ul>');
            inList = false;
          }

          htmlParts.push(`<p>${trimmed}</p>`);
        }

        if (inList) {
          htmlParts.push('</ul>');
        }
      }
    }

    return htmlParts.join('');
  }

  generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  addSection(tab: 'terms' | 'privacy' | 'about', lang: 'ar' | 'en') {
    this.sections[tab][lang].push({
      id: this.generateId(),
      title: '',
      content: '',
    });
    this.syncSectionsToForm(tab, lang);
  }

  deleteSection(tab: 'terms' | 'privacy' | 'about', lang: 'ar' | 'en', index: number) {
    if (this.sections[tab][lang].length <= 1) {
      this.sections[tab][lang] = [{ id: this.generateId(), title: '', content: '' }];
    } else {
      this.sections[tab][lang].splice(index, 1);
    }
    this.syncSectionsToForm(tab, lang);
  }

  moveSectionUp(tab: 'terms' | 'privacy' | 'about', lang: 'ar' | 'en', index: number) {
    if (index <= 0) return;
    const list = this.sections[tab][lang];
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;
    this.syncSectionsToForm(tab, lang);
  }

  moveSectionDown(tab: 'terms' | 'privacy' | 'about', lang: 'ar' | 'en', index: number) {
    const list = this.sections[tab][lang];
    if (index >= list.length - 1) return;
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
    this.syncSectionsToForm(tab, lang);
  }

  syncSectionsToForm(tab: 'terms' | 'privacy' | 'about', lang: 'ar' | 'en') {
    let formControlName = '';
    if (tab === 'terms') formControlName = lang === 'ar' ? 'terms_and_conditions_ar' : 'terms_and_conditions_en';
    if (tab === 'privacy') formControlName = lang === 'ar' ? 'privacy_policy_ar' : 'privacy_policy_en';
    if (tab === 'about') formControlName = lang === 'ar' ? 'about_us_ar' : 'about_us_en';

    const html = this.generateHtmlFromSections(this.sections[tab][lang]);
    this.settingsForm.get(formControlName)?.setValue(html, { emitEvent: false });
  }
}
