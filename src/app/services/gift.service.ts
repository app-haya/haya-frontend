import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GiftService {
  private baseUrl = environment.apiUrl + '/admin/gifts';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    });
  }

  getGifts(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.min_price) httpParams = httpParams.set('min_price', params.min_price);
    if (params.max_price) httpParams = httpParams.set('max_price', params.max_price);
    if (params.per_page) httpParams = httpParams.set('per_page', params.per_page);
    if (params.page) httpParams = httpParams.set('page', params.page);

    return this.http.get(this.baseUrl, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  getGift(id: number | string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  createGift(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data, {
      headers: this.getHeaders()
    });
  }

  updateGift(id: number | string, data: any): Observable<any> {
    // We use POST even for updates because Laravel requires it when sending FormData with files
    // The _method: 'PUT' is appended to the FormData in the component
    return this.http.post(`${this.baseUrl}/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  toggleActive(id: number | string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/toggle-active`, {}, {
      headers: this.getHeaders()
    });
  }

  deleteGift(id: number | string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
}
