import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostReportsService {
  private baseUrl = environment.apiUrl + '/admin/reports/posts';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    });
  }

  getPostReports(status: string = 'pending', page: number = 1, perPage: number = 20): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(
      `${this.baseUrl}?status=${status}&page=${page}&per_page=${perPage}`,
      { headers }
    );
  }

  hidePost(id: number, reason?: string): Observable<any> {
    const headers = this.getHeaders().set('Content-Type', 'application/json');
    const body: any = {};
    if (reason && reason.trim()) {
      body.reason = reason.trim();
    }
    return this.http.post(`${this.baseUrl}/${id}/hide`, body, { headers });
  }

  deletePost(id: number, reason?: string): Observable<any> {
    const headers = this.getHeaders().set('Content-Type', 'application/json');
    const body: any = {};
    if (reason && reason.trim()) {
      body.reason = reason.trim();
    }
    return this.http.request('DELETE', `${this.baseUrl}/${id}`, {
      headers,
      body
    });
  }
}
