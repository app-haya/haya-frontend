import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MerchantService {

  private apiUrl = 'https://hayaapp.online/api/admin'; 

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

  // 🟢 عرض كل التجار
  getAll(): Observable<any> {
    return this.http.get(`${this.apiUrl}/merchants`, { headers: this.getHeaders() });
  }

  // 🟡 عرض تاجر واحد
  show(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/merchant/show`, { id }, { headers: this.getHeaders() });
  }

  // 🔵 إضافة تاجر جديد
  add(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/merchant/add`, data, { headers: this.getHeaders() });
  }

  // 🟠 تحديث تاجر
  update(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/merchant/update`, data, { headers: this.getHeaders() });
  }

  // 🔴 حذف تاجر
delete(id: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/merchant/delete/${id}`, {}, { headers: this.getHeaders() });
}
}
