import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  apiUrl = 'https://hayaapp.online/api/api/';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

  getAllMessages(page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}admin/all/messages?page=${page}`, { headers: this.getHeaders() });
  }

  filterMessages(data: any, page: number = 1): Observable<any> {
    return this.http.post(`${this.apiUrl}admin/messages/filter?page=${page}`, data, { headers: this.getHeaders() });
  }
}
