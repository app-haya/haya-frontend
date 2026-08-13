import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  public currentUser$ = new BehaviorSubject<any>(this.getInitialUser());

  constructor(private http: HttpClient) { }

  private getInitialUser(): any {
    const userStr = localStorage.getItem('admin_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user) {
          if (user.image || user.image_url) {
            user.image_url = this.formatImageUrl(user.image_url || user.image);
          }
          return user;
        }
      } catch (e) {}
    }
    return null;
  }

  public formatImageUrl(urlOrFilename: string | null | undefined): string {
    if (!urlOrFilename) return '';
    if (urlOrFilename.startsWith('data:image')) return urlOrFilename;

    const apiDomainBase = environment.apiUrl.replace('/api', '').replace(/\/$/, '');

    if (
      urlOrFilename.includes('admin_images') ||
      urlOrFilename.includes('localhost') ||
      urlOrFilename.includes('127.0.0.1') ||
      !urlOrFilename.startsWith('http')
    ) {
      const cleanFilename = urlOrFilename.split('/').pop() || urlOrFilename;
      return `${apiDomainBase}/admin_images/${cleanFilename}`;
    }

    let formatted = urlOrFilename;
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && formatted.startsWith('http://')) {
      formatted = formatted.replace('http://', 'https://');
    }

    return formatted;
  }

  public setCurrentUser(user: any): void {
    if (user) {
      if (user.image || user.image_url) {
        user.image_url = this.formatImageUrl(user.image_url || user.image);
      }
      localStorage.setItem('admin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('admin_user');
    }
    this.currentUser$.next(user);
  }

  public getCurrentUser(): any {
    return this.currentUser$.value;
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/login`, { email, password }).pipe(
      tap((res: any) => {
        const adminData = res?.data?.admin || res?.admin || res?.data;
        if (adminData) {
          this.setCurrentUser(adminData);
        }
      })
    );
  }

  getProfile(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    }).pipe(
      tap((res: any) => {
        const userData = res?.data || res?.user || res;
        if (userData) {
          this.setCurrentUser(userData);
        }
      })
    );
  }

  logout(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    }).pipe(
      tap(() => {
        this.setCurrentUser(null);
      })
    );
  }
}