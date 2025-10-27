import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DealService {
  private apiUrl = 'https://hayaapp.online/api/'; // رابط الـ API

  constructor(private http: HttpClient) {}

  // 🛡️ إعداد الهيدر مع التوكن
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

  // 🔹 جلب كل الصفقات المعلقة
  getAllPendingDeals(page: number = 1): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}admin/deals?page=${page}`, { headers });
  }

  // 🔹 الموافقة على صفقة
  approveDeal(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}admin/deals/${id}/approve`, { headers });
  }

  // 🔹 رفض صفقة
  rejectDeal(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}admin/deals/${id}/reject`, { headers });
  }


}
