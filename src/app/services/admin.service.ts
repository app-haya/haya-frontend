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
    return this.http.get(`${this.baseUrl}/admins?page=${page}`, {
      headers: this.getHeaders()
    });
  }

  // 🟢 عرض بيانات إدمن معين
  showAdmin(id: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/show/admin/data`,
      { id },
      { headers: this.getHeaders() }
    );
  }

  // 🟢 إضافة إدمن مع roles + is_super_admin
  addAdmin(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, data, {
      headers: this.getHeaders()
    });
  }

  // 🟢 تعديل إدمن مع roles + is_super_admin
  updateAdmin(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/update/data`, data, {
      headers: this.getHeaders()
    });
  }

  // 🟢 حذف إدمن
  deleteAdmin(id: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/destroy`,
      { id },
      { headers: this.getHeaders() }
    );
  }

  // 🟣 جلب كل الصلاحيات (roles)
  getRoles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/roles`, {
      headers: this.getHeaders()
    });
  }
  createRole(data: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/roles`, data, {
    headers: this.getHeaders()
  });
}

updateRole(id: number, data: any): Observable<any> {
  return this.http.put(`${this.baseUrl}/roles/${id}`, data, {
    headers: this.getHeaders()
  });
}

deleteRole(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/roles/${id}`, {
    headers: this.getHeaders()
  });
}
}
