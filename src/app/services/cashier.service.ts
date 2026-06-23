import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CashierService {
  private apiUrl = environment.apiUrl + '/v1/cashier';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('cashier_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

  login(credentials: { email?: string; phone?: string; password?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { headers: this.getHeaders() });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }

  lookupCustomer(phone: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/customers/lookup?phone=${phone}`, { headers: this.getHeaders() });
  }

  createInvoice(data: { phone: string; invoice_number: string; amount: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/invoices`, data, { headers: this.getHeaders() });
  }

  getInvoices(page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/invoices?page=${page}`, { headers: this.getHeaders() });
  }
}
