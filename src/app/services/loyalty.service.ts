import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoyaltyService {
  private apiUrl = environment.apiUrl + '/v1/admin';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

  // Packages CRUD
  getPackages(page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/merchant/packages?page=${page}`, { headers: this.getHeaders() });
  }

  createPackage(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/merchant/packages`, data, { headers: this.getHeaders() });
  }

  updatePackage(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/merchant/packages/${id}`, data, { headers: this.getHeaders() });
  }

  deletePackage(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/merchant/packages/${id}`, { headers: this.getHeaders() });
  }

  // Merchants List & Details
  getMerchants(page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/merchants?page=${page}`, { headers: this.getHeaders() });
  }

  getMerchantDetails(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/merchants/${id}`, { headers: this.getHeaders() });
  }

  addMerchantCredit(id: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/merchants/${id}/add-credit`, data, { headers: this.getHeaders() });
  }

  getMerchantInvoices(id: number, page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/merchants/${id}/invoices?page=${page}`, { headers: this.getHeaders() });
  }

  getMerchantBalanceLogs(id: number, page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/merchants/${id}/balance-logs?page=${page}`, { headers: this.getHeaders() });
  }

  // Reports
  getPurchasesReport(page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/merchant/purchases?page=${page}`, { headers: this.getHeaders() });
  }

  getInvoicesReport(page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/merchant/invoices?page=${page}`, { headers: this.getHeaders() });
  }

  // Settings
  getSettings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/settings/loyalty`, { headers: this.getHeaders() });
  }

  updateSettings(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/settings/loyalty`, data, { headers: this.getHeaders() });
  }
}
