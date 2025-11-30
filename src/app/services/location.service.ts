import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private apiUrl = 'https://hayaapp.online/api'; // change this to your backend URL

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

  // ===================== Countries =====================

getCountries(lang: string = 'en', page: number = 1): Observable<any> {
  const headers = this.getHeaders();
  const body = { lang, page };
  return this.http.post(`${this.apiUrl}/admin/countries`, body, { headers });
}

  addCountry(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/countries/store`, data, { headers: this.getHeaders() });
  }

  updateCountry(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/countries/update`, data, { headers: this.getHeaders() });
  }

deleteCountry(data: { id: number }): Observable<any> {
  return this.http.post(`${this.apiUrl}/admin/countries/destroy`, data, { headers: this.getHeaders() });
}

showCountry(id: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/admin/countries/show`, { id }, { headers: this.getHeaders() });
}

  // ===================== Cities =====================
getCities(data: any): Observable<any> {
  const headers = this.getHeaders();
  return this.http.post(`${this.apiUrl}/admin/cities`, data, { headers });
}
addCity(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/admin/city/add`, data, { headers: this.getHeaders() });
}

updateCity(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/admin/city/update`, data, { headers: this.getHeaders() });
}

deleteCity(data: { id: number }): Observable<any> {
  return this.http.post(`${this.apiUrl}/admin/city/delete`, data, { headers: this.getHeaders() });
}

showCity(id: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/admin/city/show`, { id }, { headers: this.getHeaders() });
}

}