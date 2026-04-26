import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private baseUrl = environment.apiUrl + '/admin/wallet';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    });
  }

  getTransactions(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.type) httpParams = httpParams.set('type', params.type);
    if (params.user_id) httpParams = httpParams.set('user_id', params.user_id);
    if (params.from_date) httpParams = httpParams.set('from_date', params.from_date);
    if (params.to_date) httpParams = httpParams.set('to_date', params.to_date);
    if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
    if (params.page) httpParams = httpParams.set('page', params.page);

    return this.http.get(`${this.baseUrl}/transactions`, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  getUserTransactions(userId: string | number, page: number = 1): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${userId}/transactions?page=${page}`, {
      headers: this.getHeaders()
    });
  }
}
