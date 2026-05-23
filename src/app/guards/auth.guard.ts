import { Injectable } from '@angular/core';
import { CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { NotificationService } from '../services/notification.service';
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivateChild {
  constructor(private router: Router, private notification: NotificationService) { }
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('admin_token');
    const userStr = localStorage.getItem('admin_user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!token || !user) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
    const requiredRole = route.data['role'];
    if (user.is_super_admin === 1) {
      return true;
    }
    if (requiredRole && !user.roles?.some((r: any) => r.name === requiredRole)) {
      this.notification.error('Access denied');
      this.router.navigate(['/admin/dashboardcount']);
      return false;
    }
    return true;
  }
}
