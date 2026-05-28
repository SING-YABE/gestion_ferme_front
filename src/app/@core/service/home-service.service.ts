import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StatsReproductions {
  truiesGestantes: number;
  misesBasMois: number;
  porceletsSevres: number;
  tauxReussite: number;
  totalSaillies: number;
}
export interface AlerteMiseBas {
  truieCode: string;
  dateMiseBasPrevue: string;
  joursRestants: number;
}
export interface PourcentageTypeCharge {
  typeDepense: string;
  montant: number;
  pourcentage: number;
}


export interface AdvisorAlert {
  level: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  entity: Record<string, any>; // flexible pour tous les types futurs
}

export interface AdvisorAlertsResponse {
  alerts: AdvisorAlert[];
  summary: {
    total_alerts: number;
    by_level: {
      critical: number;
      warning: number;
      info?: number;
    };
  };
  error?: string;
}


@Injectable({
  providedIn: 'root'
})
export class HomeService {

  private baseUrl = '/api';

  constructor(private http: HttpClient) { }

  getStatsReproductions(): Observable<StatsReproductions> {
    return this.http.get<StatsReproductions>(`${this.baseUrl}/reproductions/stats`);
  }


  getPourcentageParType(): Observable<PourcentageTypeCharge[]> {
    return this.http.get<PourcentageTypeCharge[]>(`${this.baseUrl}/charges-diverses/pourcentage-par-type`);
  }

  getAlertes(): Observable<AlerteMiseBas[]> {
    return this.http.get<AlerteMiseBas[]>(`${this.baseUrl}/reproductions/alertes`);
  }

  getEvolutionVentes() {
    return this.http.get<any[]>(`${this.baseUrl}/ventes/evolution`);
  }
  
private pythonUrl = 'http://localhost:8000';

getAdvisorAlerts(): Observable<AdvisorAlertsResponse> {
  return this.http.get<AdvisorAlertsResponse>(`${this.pythonUrl}/api/advisor/alerts`);
}
}
















