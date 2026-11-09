import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InviteFilters {
  from?: string;
  to?: string;
  search?: string;
  channel?: string;
  inviter_id?: number;
  page?: number;
  per_page?: number;
}

@Injectable({
  providedIn: 'root'
})
export class InvitesService {
  private baseUrl = environment.apiUrl + '/admin/invites';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    });
  }

  private params(filters: InviteFilters): HttpParams {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }

  getStats(filters: InviteFilters): Observable<any> {
    return this.http.get(`${this.baseUrl}/stats`, { headers: this.getHeaders(), params: this.params(filters) });
  }

  getInvites(filters: InviteFilters): Observable<any> {
    return this.http.get(this.baseUrl, { headers: this.getHeaders(), params: this.params(filters) });
  }

  getInviters(filters: InviteFilters): Observable<any> {
    return this.http.get(`${this.baseUrl}/inviters`, { headers: this.getHeaders(), params: this.params(filters) });
  }

  getInviter(userId: number, page: number = 1, perPage: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/inviters/${userId}`, {
      headers: this.getHeaders(),
      params: this.params({ page, per_page: perPage })
    });
  }
}
