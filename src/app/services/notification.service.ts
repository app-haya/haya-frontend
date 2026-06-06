import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

export interface Notification {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();

  constructor(private translate: TranslateService) {}

  getNotification(): Observable<Notification> {
    return this.notificationSubject.asObservable();
  }

  show(notification: Notification) {
    const translatedMessage = this.translate.instant(notification.message);
    this.notificationSubject.next({
      ...notification,
      message: translatedMessage
    });
  }

  success(message: string, duration = 3000) {
    this.show({ type: 'success', message, duration });
  }

  error(message: string, duration = 3000) {
    this.show({ type: 'error', message, duration });
  }

  info(message: string, duration = 3000) {
    this.show({ type: 'info', message, duration });
  }

  warning(message: string, duration = 3000) {
    this.show({ type: 'warning', message, duration });
  }
}