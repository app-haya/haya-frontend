import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InterestsService {
  private apiUrl = 'http://127.0.0.1:8000/api'; // backend URL

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

getInterests(lang: string = 'en', page: number = 1): Observable<any> {
  const headers = this.getHeaders();
  const body = { lang, page };
  return this.http.post(`${this.apiUrl}/admin/interests?page=${page}`, body, { headers });
}
  addInterest(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/interest/add`, data, { headers: this.getHeaders() });
  }

  updateInterest(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/interest/update`, data, { headers: this.getHeaders() });
  }

  deleteInterest(data: { id: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/interest/delete`, data, { headers: this.getHeaders() });
  }

  showInterest(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/interest/show`, { id }, { headers: this.getHeaders() });
  }
}
