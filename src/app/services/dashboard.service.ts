import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://127.0.0.1:8000/api'; 

  constructor(private http: HttpClient) {}

  // ✅ Get all banned words
  getAll(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashcount`);
  }}
