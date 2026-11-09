import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PinnedPostsService {
  private baseUrl = environment.apiUrl + '/admin/posts';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    });
  }

  getPosts(search: string = '', page: number = 1, perPage: number = 20): Observable<any> {
    let params = new HttpParams().set('page', page).set('per_page', perPage);
    if (search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get(this.baseUrl, { headers: this.getHeaders(), params });
  }

  getPinned(): Observable<any> {
    return this.http.get(`${this.baseUrl}/pinned`, { headers: this.getHeaders() });
  }

  pin(postId: number, durationHours: number | null): Observable<any> {
    const body = durationHours ? { duration_hours: durationHours } : {};
    return this.http.post(`${this.baseUrl}/${postId}/pin`, body, {
      headers: this.getHeaders().set('Content-Type', 'application/json')
    });
  }

  unpin(postId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${postId}/unpin`, {}, {
      headers: this.getHeaders().set('Content-Type', 'application/json')
    });
  }
}
