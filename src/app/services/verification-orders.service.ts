import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VerificationOrdersService {
  private baseUrl = environment.apiUrl + '/admin/verification-orders';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    });
  }

  getOrders(status: string = 'pending_review', page: number = 1, perPage: number = 20): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(
      `${this.baseUrl}?status=${status}&page=${page}&per_page=${perPage}`,
      { headers }
    );
  }

  approveOrder(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/${id}/approve`, {}, { headers });
  }

  rejectOrder(id: number, reason?: string, attachment?: File): Observable<any> {
    const token = localStorage.getItem('admin_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    });

    if (attachment) {
      const formData = new FormData();
      if (reason) formData.append('reason', reason);
      formData.append('attachment', attachment);
      return this.http.post(`${this.baseUrl}/${id}/reject`, formData, { headers });
    }

    const body = reason ? { reason } : {};
    const jsonHeaders = this.getHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${this.baseUrl}/${id}/reject`, body, { headers: jsonHeaders });
  }
}
