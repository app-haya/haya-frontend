import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'https://hayaapp.online/api/admin';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    });
  }

  // 🟢 جلب جميع الإدمنز
getAllAdmins(page: number = 1): Observable<any> {
  const headers = this.getHeaders();
  const body = { page }; 
return this.http.get(`${this.baseUrl}/admins?page=${page}`, { headers });
}
  // 🟢 عرض بيانات إدمن معين
  showAdmin(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/show/admin/data`, { id }, { headers: this.getHeaders() });
  }

  // 🟢 إضافة إدمن جديد
  addAdmin(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, data, { headers: this.getHeaders() });
  }

  // 🟢 تعديل بيانات إدمن
  updateAdmin(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/update/data`, data, { headers: this.getHeaders() });
  }

  // 🟢 حذف إدمن
  deleteAdmin(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/destroy`, { id }, { headers: this.getHeaders() });
  }
}
