import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  private baseUrl = environment.apiUrl + '/admin/support';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    });
  }

  // Official Support Account
  getOfficialAccount(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.baseUrl}/official`, { headers });
  }

  setOfficialAccount(identifier: string, force: boolean = false): Observable<any> {
    const headers = this.getHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${this.baseUrl}/official`, { identifier, force }, { headers });
  }

  // Support Departments
  getDepartments(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.baseUrl}/departments`, { headers });
  }

  createDepartment(data: { name_ar: string; name_en: string; active?: boolean }): Observable<any> {
    const headers = this.getHeaders().set('Content-Type', 'application/json');
    return this.http.post(`${this.baseUrl}/departments`, data, { headers });
  }

  updateDepartment(id: number, data: { name_ar?: string; name_en?: string; active?: boolean }): Observable<any> {
    const headers = this.getHeaders().set('Content-Type', 'application/json');
    return this.http.put(`${this.baseUrl}/departments/${id}`, data, { headers });
  }

  deleteDepartment(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.baseUrl}/departments/${id}`, { headers });
  }

  updateDepartmentAdmins(departmentId: number, adminIds: number[]): Observable<any> {
    const headers = this.getHeaders().set('Content-Type', 'application/json');
    return this.http.put(`${this.baseUrl}/departments/${departmentId}/admins`, { admin_ids: adminIds }, { headers });
  }

  // Support Chats
  getSupportChats(page: number = 1, perPage: number = 20, departmentId?: number): Observable<any> {
    const headers = this.getHeaders();
    let url = `${this.baseUrl}/chats?page=${page}&per_page=${perPage}`;
    if (departmentId) {
      url += `&department_id=${departmentId}`;
    }
    return this.http.get(url, { headers });
  }

  getChatMessages(chatUuid: string, page: number = 1, perPage: number = 50): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.baseUrl}/chats/${chatUuid}/messages?page=${page}&per_page=${perPage}`, { headers });
  }

  replyToChat(chatUuid: string, message?: string, file?: File): Observable<any> {
    const token = localStorage.getItem('admin_token');

    if (file) {
      const formData = new FormData();
      if (message) formData.append('message', message);
      formData.append('file', file);

      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      });
      return this.http.post(`${this.baseUrl}/chats/${chatUuid}/reply`, formData, { headers });
    } else {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      });
      return this.http.post(`${this.baseUrl}/chats/${chatUuid}/reply`, { message }, { headers });
    }
  }
}
