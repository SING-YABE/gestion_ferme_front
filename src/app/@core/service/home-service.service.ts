import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

const API = 'http://localhost:8080/api';

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

export interface AnimalCountByType {
  typeAnimal: string;
  count: number;
}

export interface SyntheseFinanciere {
  totalVentes: number;
  totalDepenses: number;
  totalChargesDiverses: number;
  totalAlimentations: number;
  beneficeNet: number;
  periode?: string;
}

export interface TacheStats {
  aFaire: number;
  enCours: number;
  enAttenteValidation: number;
  validees: number;
  invalidees: number;
  expirees: number;
}

export interface AdvisorAlert {
  level: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  entity: Record<string, any>;
}

export interface AdvisorAlertsResponse {
  alerts: AdvisorAlert[];
  summary: { total_alerts: number; by_level: { critical: number; warning: number; info?: number; } };
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class HomeService {

  constructor(private http: HttpClient) {}

  getStatsReproductions(): Observable<StatsReproductions> {
    return this.http.get<StatsReproductions>(`${API}/reproductions/stats`).pipe(catchError(() => of({} as StatsReproductions)));
  }

  getPourcentageParType(): Observable<PourcentageTypeCharge[]> {
    return this.http.get<PourcentageTypeCharge[]>(`${API}/charges-diverses/pourcentage-par-type`).pipe(catchError(() => of([])));
  }

  getAlertes(): Observable<AlerteMiseBas[]> {
    return this.http.get<AlerteMiseBas[]>(`${API}/reproductions/alertes`).pipe(catchError(() => of([])));
  }

  getTotalAnimaux(): Observable<number> {
    return this.http.get<number>(`${API}/animaux/count`).pipe(catchError(() => of(0)));
  }

  getAnimauxParType(): Observable<AnimalCountByType[]> {
    return this.http.get<AnimalCountByType[]>(`${API}/animaux/count-by-type`).pipe(catchError(() => of([])));
  }

  getSynthese(): Observable<SyntheseFinanciere> {
    return this.http.get<SyntheseFinanciere>(`${API}/synthese`).pipe(catchError(() => of({} as SyntheseFinanciere)));
  }

  getTacheStats(): Observable<TacheStats> {
    return this.http.get<TacheStats>(`${API}/taches/admin/stats`).pipe(catchError(() => of({} as TacheStats)));
  }

  getTachesAValider(): Observable<any[]> {
    return this.http.get<any[]>(`${API}/taches/admin/a-valider`).pipe(catchError(() => of([])));
  }

  getTachesJour(): Observable<any[]> {
    return this.http.get<any[]>(`${API}/taches/admin/aujourd-hui`).pipe(catchError(() => of([])));
  }

  getAdvisorAlerts(): Observable<AdvisorAlertsResponse> {
    return this.http.get<AdvisorAlertsResponse>('http://localhost:8000/api/advisor/alerts').pipe(
      catchError(() => of({ alerts: [], summary: { total_alerts: 0, by_level: { critical: 0, warning: 0 } } }))
    );
  }
}
