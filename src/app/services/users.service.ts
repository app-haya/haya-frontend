import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private baseUrl = environment.apiUrl + '/admin/user';
  private countriesUrl = environment.apiUrl + '/countries';
  private citiesUrl = environment.apiUrl + '/cities';
  private pointsUrl = environment.apiUrl + '/admin/points';

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    });
  }

  getAllUsers(page: number = 1, search: string = ''): Observable<any> {
    let url = `${this.baseUrl}/all?page=${page}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return this.http.get(url, { headers: this.getHeaders() });
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

  getCountries(lang: string = 'en'): Observable<any> {
    return this.http.get(`${this.countriesUrl}?lang=${lang}`, { headers: this.getHeaders() });
  }

  getCities(countryId: number, lang: string = 'en'): Observable<any> {
    return this.http.get(`${this.citiesUrl}?id=${countryId}&lang=${lang}`, { headers: this.getHeaders() });
  }

  getPendingUsers(page: number = 1): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.baseUrl}/pending?page=${page}`, { headers });
  }

  approveUser(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/${id}/approve`, {}, { headers });
  }

  rejectUser(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/${id}/reject`, {}, { headers });
  }

  getPendingCreators(page: number = 1): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.baseUrl}/creator/pending?page=${page}`, { headers });
  }

  approveCreator(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/creator/${id}/approve`, {}, { headers });
  }

  rejectCreator(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/creator/${id}/reject`, {}, { headers });
  }

  getTopUsersWithNotes(page: number = 1, perPage: number = 30, month?: number, year?: number): Observable<any> {
    const headers = this.getHeaders();
    let url = `${this.pointsUrl}/top-with-notes?page=${page}&per_page=${perPage}`;
    if (month) url += `&month=${month}`;
    if (year) url += `&year=${year}`;
    return this.http.get(url, { headers });
  }

  updateUserNote(userId: number, data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.pointsUrl}/top-notes/${userId}`, data, { headers });
  }
}