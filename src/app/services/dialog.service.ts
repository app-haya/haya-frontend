import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface DialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogSubject = new Subject<DialogOptions | null>();
  dialogState$ = this.dialogSubject.asObservable();

  confirm(options: DialogOptions) {
    this.dialogSubject.next(options);
  }

  close() {
    this.dialogSubject.next(null);
  }
}
