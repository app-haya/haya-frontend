import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root',
})
export class CashierAuthGuard implements CanActivate {
  constructor(private router: Router, private notification: NotificationService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('cashier_token');
    const cashierStr = localStorage.getItem('cashier_user');
    if (!token || !cashierStr) {
      this.router.navigate(['/cashier/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
    return true;
  }
}
