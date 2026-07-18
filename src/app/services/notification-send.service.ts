import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationSendService {
  private apiUrl = environment.apiUrl + '/admin/notifications';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    });
  }

  send(data: {
    title: string;
    body: string;
    user_type: string;
    verification_status: string;
    country_id?: number | null;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, data, { headers: this.getHeaders() });
  }
}
