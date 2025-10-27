import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://hayaapp.online/api';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/login`, { email, password });
  }

  getProfile(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  logout(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
