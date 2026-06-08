import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;
  private refreshBadges$ = new BehaviorSubject<void>(undefined);

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashcount`);
  }

  triggerRefresh(): void {
    this.refreshBadges$.next();
  }

  getRefreshObservable(): Observable<void> {
    return this.refreshBadges$.asObservable();
  }
}