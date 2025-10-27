import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private baseUrl = 'https://hayaapp.online/api/admin/user';
  private countriesUrl = 'https://hayaapp.online/api/countries';
  private citiesUrl = 'https://hayaapp.online/api/cities';

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
}