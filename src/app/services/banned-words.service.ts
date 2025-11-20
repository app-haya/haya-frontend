import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BannedWordsService {
  private apiUrl = 'http://127.0.0.1:8000/api'; 

  constructor(private http: HttpClient) {}

  // ✅ Get all banned words
  getAll(): Observable<any> {
    return this.http.get(`${this.apiUrl}/banned-words`);
  }

  // ✅ Add new word
  add(word: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/banned-words`, { word });
  }

  // ✅ Update word
  update(id: number, word: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/banned-words/${id}`, { word });
  }

  // ✅ Delete word
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/banned-words/${id}`);
  }
}
