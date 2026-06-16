import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const BASE = `${environment.apiUrl}/api/super-admin`;

export interface PlatformStats {
  totalFermes: number;
  fermesActives: number;
  fermesSuspendues: number;
  totalUtilisateurs: number;
  totalAnimaux: number;
  generatedAt: string;
}

export interface FermeInfo {
  id: number;
  fermeCode: string;
  nomFerme: string;
  schemaName: string;
  active: boolean;
  nbUtilisateurs: number;
  nbAnimaux: number;
}

export interface PlanConfig {
  maxAnimauxFreePlan: number;
  maxAnimauxPremiumPlan: number;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class SuperAdminService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<PlatformStats> {
    return this.http.get<PlatformStats>(`${BASE}/stats`);
  }

  getFermes(): Observable<FermeInfo[]> {
    return this.http.get<FermeInfo[]>(`${BASE}/fermes`);
  }

  toggleFerme(fermeCode: string): Observable<any> {
    return this.http.put(`${BASE}/fermes/${fermeCode}/toggle`, {});
  }

  getPlanConfig(): Observable<PlanConfig> {
    return this.http.get<PlanConfig>(`${BASE}/plan-config`);
  }

  updatePlanConfig(config: { maxAnimauxFreePlan: number; maxAnimauxPremiumPlan: number }): Observable<any> {
    return this.http.put(`${BASE}/plan-config`, config);
  }
}
