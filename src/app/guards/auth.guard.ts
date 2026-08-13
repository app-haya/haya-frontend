import { Injectable } from '@angular/core';
import { CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { isSuperAdmin, getUserPermissions, getFirstPermittedRoute } from '../utils/permission-helper';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivateChild {
  constructor(private router: Router, private notification: NotificationService) { }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const token = localStorage.getItem('admin_token');
    const userStr = localStorage.getItem('admin_user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!token || !user) {
      return this.router.parseUrl('/login');
    }

    if (isSuperAdmin(user)) {
      return true;
    }

    const perms = getUserPermissions(user);
    const currentUrl = state.url || '';

    if (currentUrl.includes('/admin/profile') || route.routeConfig?.path === 'profile') {
      return true;
    }

    // If attempting to open default dashboard route without explicit dashboard permission
    if ((currentUrl === '/admin' || currentUrl.includes('/admin/dashboardcount')) && !perms.has('dashboard')) {
      const firstRoute = getFirstPermittedRoute(user);
      if (firstRoute && firstRoute !== '/admin/dashboardcount' && !currentUrl.includes(firstRoute)) {
        return this.router.parseUrl(firstRoute);
      }
    }

    const requiredRole = route.data['role'];
    if (requiredRole) {
      const roleKey = requiredRole.toString().toLowerCase();
      const hasAccess =
        perms.has(roleKey) ||
        (roleKey === 'verification' && (perms.has('verifycation') || perms.has('verification'))) ||
        (roleKey === 'notifications' && (perms.has('messages') || perms.has('send_notifications') || perms.has('notifications'))) ||
        (roleKey === 'top30' && (perms.has('top30') || perms.has('top 30')));

      if (!hasAccess) {
        const fallbackRoute = getFirstPermittedRoute(user);
        if (fallbackRoute && fallbackRoute !== currentUrl && !currentUrl.includes(fallbackRoute)) {
          this.notification.error('Access denied');
          return this.router.parseUrl(fallbackRoute);
        }
      }
    }

    return true;
  }
}
