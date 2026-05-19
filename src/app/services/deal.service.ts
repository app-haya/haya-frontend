import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class DealService {
  private apiUrl = environment.apiUrl + '/';
  constructor(private http: HttpClient) {}
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    });
  }
  getAllPendingDeals(page: number = 1): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}admin/deals?page=${page}`, { headers });
  }
  approveDeal(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}admin/deals/${id}/approve`, {
      headers,
    });
  }
  rejectDeal(id: number, reason: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(
      `${this.apiUrl}admin/deals/${id}/reject`,
      { reason: reason },
      { headers },
    );
  }
  addDeal(formData: FormData): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}admin/deals/add`, formData, {
      headers,
    });
  }
  updateDeal(id: number, formData: FormData): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}admin/deals/update/${id}`, formData, {
      headers,
    });
  }
  deleteDeal(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(
      `${this.apiUrl}admin/deals/delete/${id}`,
      {},
      { headers },
    );
  }
  getUsersSimpleList(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}admin/users/list`, { headers });
  }
  getAllApprovedDeals(page: number = 1): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}admin/alldealsapproved?page=${page}`, {
      headers,
    });
  }
  getAllRejectedDeals(page: number = 1): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}admin/alldealsrejected?page=${page}`, {
      headers,
    });
  }
  getDealOrders(id: number, page: number = 1): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(
      `${this.apiUrl}admin/deals/${id}/orders?page=${page}`,
      { headers },
    );
  }
}
