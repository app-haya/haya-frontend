import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private baseUrl = environment.apiUrl + '/admin/settings';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    });
  }

  getTerms(): Observable<any> {
    return this.http.get(`${this.baseUrl}/terms`, { headers: this.getHeaders() });
  }

  getPrivacy(): Observable<any> {
    return this.http.get(`${this.baseUrl}/privacy`, { headers: this.getHeaders() });
  }

  getAboutUs(): Observable<any> {
    return this.http.get(`${this.baseUrl}/about-us`, { headers: this.getHeaders() });
  }

  getPublicTerms(lang: string = 'ar'): Observable<any> {
    return this.http.get(`${environment.apiUrl}/terms?lang=${lang}`);
  }

  getPublicPrivacy(lang: string = 'ar'): Observable<any> {
    return this.http.get(`${environment.apiUrl}/privacy?lang=${lang}`);
  }

  getPublicAboutUs(lang: string = 'ar'): Observable<any> {
    return this.http.get(`${environment.apiUrl}/About-us?lang=${lang}`);
  }

  // Common endpoint mentioned by user: GET /api/admin/settings/
  getAllSettings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/`, { headers: this.getHeaders() });
  }

  saveSettings(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, data, { headers: this.getHeaders() });
  }

  updateSettings(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/update`, data, { headers: this.getHeaders() });
  }

  deleteSettings(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/delete`, { id }, { headers: this.getHeaders() });
  }
}
