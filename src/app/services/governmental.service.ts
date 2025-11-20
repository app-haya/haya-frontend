import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GovernmentalService {

  private apiUrl = 'http://127.0.0.1:8000/api/admin'; // نفس مسار Laravel API

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

  // 🟢 عرض كل الجهات الحكومية
getAll(page: number = 1): Observable<any> {
  return this.http.post(
    `${this.apiUrl}/governmentals`,
    { page },
    { headers: this.getHeaders() }
  );
}

  // 🟡 عرض جهة واحدة
  show(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/governmental/show`, { id }, { headers: this.getHeaders() });
  }

  // 🔵 إضافة جهة جديدة
  add(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/governmental/add`, data, { headers: this.getHeaders() });
  }

  // 🟠 تحديث جهة
  update(data: any): Observable<any> {
    // لاحظ إننا مش بنبعت id لوحده في الـ URL
    return this.http.post(
      `${this.apiUrl}/governmental/update`,
      data,
      { headers: this.getHeaders() }
    );
  }
  // 🔴 حذف جهة
delete(id: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/governmental/delete/${id}`, {}, { headers: this.getHeaders() });
}
}
