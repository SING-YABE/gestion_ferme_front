import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const BASE = `${environment.apiUrl}/api/super-admin`;

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface PlatformStats {
  totalFermes: number;
  fermesActives: number;
  abonnementsActifs: number;
  abonnementsEssai: number;
  abonnementsExpires: number;
  totalUtilisateurs: number;
  totalAnimaux: number;
  generatedAt: string;
}

export interface FermeAdminDTO {
  id: number;
  fermeCode: string;
  nomFerme: string;
  active: boolean;
  subscriptionStatut: string | null;
  planNom: string | null;
  endDate: string | null;
  trialEndsAt: string | null;
  nbUtilisateurs: number;
  nbAnimaux: number;
}

/** @deprecated Alias gardé pour compatibilité avec l'ancien code */
export type FermeInfo = FermeAdminDTO;

export interface PlanConfig {
  id: number;
  nom: string;
  description: string | null;
  prixFcfa: number;
  dureeDays: number;
  trialDays: number;
  maxAnimaux: number;
  maxUtilisateurs: number;
  maxBatiments: number;
  hasAssistantIA: boolean;
  hasAlertesSms: boolean;
  hasSyntheseComplete: boolean;
  hasExportPdf: boolean;
  hasPrevisionPrix: boolean;
  actif: boolean;
  ordre: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlanConfigForm {
  nom: string;
  description: string | null;
  prixFcfa: number;
  dureeDays: number;
  trialDays: number;
  maxAnimaux: number;
  maxUtilisateurs: number;
  maxBatiments: number;
  hasAssistantIA: boolean;
  hasAlertesSms: boolean;
  hasSyntheseComplete: boolean;
  hasExportPdf: boolean;
  hasPrevisionPrix: boolean;
  actif: boolean;
  ordre: number;
}

export interface TransactionDTO {
  fermeCode: string;
  nomFerme: string;
  planNom: string;
  phoneNumber: string;
  montantAttendu: number;
  statut: string;
  responseCode: string | null;
  createdAt: string;
}

export interface ManualAssignDTO {
  planId: number;
  dureeDays: number;
  notes?: string;
}

export interface SuspendDTO {
  raison?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class SuperAdminService {
  constructor(private http: HttpClient) {}

  // ── Stats & fermes ────────────────────────────────────────────────────────

  getStats(): Observable<PlatformStats> {
    return this.http.get<PlatformStats>(`${BASE}/stats`);
  }

  getFermes(): Observable<FermeAdminDTO[]> {
    return this.http.get<FermeAdminDTO[]>(`${BASE}/fermes`);
  }

  toggleFerme(fermeCode: string): Observable<{ active: boolean; message: string }> {
    return this.http.put<{ active: boolean; message: string }>(`${BASE}/fermes/${fermeCode}/toggle`, {});
  }

  // ── Plans CRUD ────────────────────────────────────────────────────────────

  getPlans(): Observable<PlanConfig[]> {
    return this.http.get<PlanConfig[]>(`${BASE}/plans`);
  }

  createPlan(form: PlanConfigForm): Observable<PlanConfig> {
    return this.http.post<PlanConfig>(`${BASE}/plans`, form);
  }

  updatePlan(id: number, form: PlanConfigForm): Observable<PlanConfig> {
    return this.http.put<PlanConfig>(`${BASE}/plans/${id}`, form);
  }

  deletePlan(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${BASE}/plans/${id}`);
  }

  togglePlanActif(id: number): Observable<{ id: number; actif: boolean; message: string }> {
    return this.http.put<{ id: number; actif: boolean; message: string }>(`${BASE}/plans/${id}/toggle-actif`, {});
  }

  // ── Abonnements (gestion manuelle) ───────────────────────────────────────

  assignPlan(fermeCode: string, dto: ManualAssignDTO): Observable<{ message: string; endDate: string }> {
    return this.http.put<{ message: string; endDate: string }>(`${BASE}/subscriptions/${fermeCode}/assign`, dto);
  }

  toggleSuspendSubscription(fermeCode: string, dto: SuspendDTO = {}): Observable<{ statut: string; message: string }> {
    return this.http.put<{ statut: string; message: string }>(`${BASE}/subscriptions/${fermeCode}/suspend`, dto);
  }

  // ── Transactions ──────────────────────────────────────────────────────────

  getTransactions(): Observable<TransactionDTO[]> {
    return this.http.get<TransactionDTO[]>(`${BASE}/transactions`);
  }
}
