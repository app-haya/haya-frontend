import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private baseUrl = 'http://127.0.0.1:8000/api/admin/user';
  private countriesUrl = 'http://127.0.0.1:8000/api/countries';
  private citiesUrl = 'http://127.0.0.1:8000/api/cities';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    });
  }

  // User CRUD operations
  getAllUsers(page: number = 1): Observable<any> {
    return this.http.get(`${this.baseUrl}/all?page=${page}`, { headers: this.getHeaders() });
  }

  showUser(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/show`, { id }, { headers: this.getHeaders() });
  }

  addUser(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/store`, data, { headers: this.getHeaders() });
  }

  updateUser(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/update`, data, { headers: this.getHeaders() });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/delete`, { id }, { headers: this.getHeaders() });
  }

  // Location data
  getCountries(lang: string = 'en'): Observable<any> {
    return this.http.get(`${this.countriesUrl}?lang=${lang}`, { headers: this.getHeaders() });
  }

  getCities(countryId: number, lang: string = 'en'): Observable<any> {
    return this.http.get(`${this.citiesUrl}?id=${countryId}&lang=${lang}`, { headers: this.getHeaders() });
  }
    // 🔹 جلب المستخدمين pending
  getPendingUsers(page: number = 1): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.baseUrl}/pending?page=${page}`, { headers });
  }

  // 🔹 الموافقة على المستخدم
  approveUser(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/${id}/approve`, {}, { headers });
  }

  // 🔹 رفض المستخدم
  rejectUser(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/${id}/reject`, {}, { headers });
  }
  // 🔹 جلب الـ creators pending
getPendingCreators(page: number = 1): Observable<any> {
  const headers = this.getHeaders();
  return this.http.get(`${this.baseUrl}/creator/pending?page=${page}`, { headers });
}

// 🔹 الموافقة على Creator
approveCreator(id: number): Observable<any> {
  const headers = this.getHeaders();
  return this.http.post(`${this.baseUrl}/creator/${id}/approve`, {}, { headers });
}

// 🔹 رفض Creator
rejectCreator(id: number): Observable<any> {
  const headers = this.getHeaders();
  return this.http.post(`${this.baseUrl}/creator/${id}/reject`, {}, { headers });
}
}