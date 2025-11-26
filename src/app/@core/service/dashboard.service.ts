// src/app/@core/service/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) { }

  // Admin
  getAdminStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin`);
  }

  // Demandeur
  getDemandeurStats(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/demandeur/${userId}`);
  }

  // Approbateur
  getApprobateurStats(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/approbateur/${userId}`);
  }

  // Gestionnaire
  getGestionnaireStats(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/gestionnaire/${userId}`);
  }

  // Sans rôle
  getSansRoleStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sans-role`);
  }
}