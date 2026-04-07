import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DialogOptions } from '../../services/dialog.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="dialog-overlay" *ngIf="options" (click)="onCancel()">
      <div class="dialog-card shadow-lg" (click)="$event.stopPropagation()" [ngClass]="options.type || 'danger'">
        <div class="dialog-icon">
          <i class="bi" [ngClass]="getIcon()"></i>
        </div>
        <h3 class="dialog-title text-center">{{ (options.title || 'Confirmation') | translate }}</h3>
        <p class="dialog-message text-center">{{ options.message | translate }}</p>
        
        <div class="dialog-actions">
          <button class="btn btn-confirm" (click)="onConfirm()">
            {{ (options.confirmText || 'Confirm') | translate }}
          </button>
          <button class="btn btn-cancel" (click)="onCancel()">
            {{ (options.cancelText || 'Cancel') | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.2s ease-out;
    }
    .dialog-card {
      background: white;
      border-radius: 24px;
      padding: 30px;
      width: 400px;
      max-width: 90%;
      display: flex; flex-direction: column; align-items: center;
      animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .dialog-icon {
      width: 70px; height: 70px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 32px;
      margin-bottom: 20px;
    }
    .danger .dialog-icon { background: #fee2e2; color: #dc2626; }
    .warning .dialog-icon { background: #fef3c7; color: #d97706; }
    .info .dialog-icon { background: #e0f2fe; color: #0284c7; }

    .dialog-title { font-weight: 800; margin-bottom: 15px; color: #111827; }
    .dialog-message { color: #4b5563; font-size: 16px; margin-bottom: 30px; line-height: 1.5; }

    .dialog-actions { display: flex; gap: 12px; width: 100%; }
    .btn {
      flex: 1; padding: 12px; border-radius: 12px; font-weight: 700;
      border: none; cursor: pointer; transition: all 0.2s;
    }
    .btn-confirm { background: #7a3ca0; color: white; }
    .btn-confirm:hover { background: #6a2c90; transform: translateY(-2px); }
    
    .danger .btn-confirm { background: #dc2626; }
    .danger .btn-confirm:hover { background: #b91c1c; }

    .btn-cancel { background: #f3f4f6; color: #374151; }
    .btn-cancel:hover { background: #e5e7eb; }

    /* Dark Mode Support */
    :host-context(.dark-mode) .dialog-card { background: #1f2937; border: 1px solid #374151; }
    :host-context(.dark-mode) .dialog-title { color: #f9fafb; }
    :host-context(.dark-mode) .dialog-message { color: #9ca3af; }
    :host-context(.dark-mode) .btn-cancel { background: #374151; color: #d1d5db; }
    :host-context(.dark-mode) .btn-cancel:hover { background: #4b5563; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class ConfirmDialog implements OnInit {
  options: DialogOptions | null = null;

  constructor(private dialogService: DialogService) {}

  ngOnInit() {
    this.dialogService.dialogState$.subscribe(state => {
      this.options = state;
    });
  }

  getIcon() {
    if (!this.options) return '';
    switch(this.options.type) {
      case 'danger': return 'bi-exclamation-octagon';
      case 'warning': return 'bi-exclamation-triangle';
      case 'info': return 'bi-info-circle';
      default: return 'bi-question-circle';
    }
  }

  onConfirm() {
    if (this.options?.onConfirm) this.options.onConfirm();
    this.dialogService.close();
  }

  onCancel() {
    if (this.options?.onCancel) this.options.onCancel();
    this.dialogService.close();
  }
}
