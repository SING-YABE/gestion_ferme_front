import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ── DTOs alignés sur le backend ───────────────────────────────────────────────

export interface PlanPublicDTO {
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
}

export interface LimitsDTO {
  maxAnimaux: number;
  maxUtilisateurs: number;
  maxBatiments: number;
  currentAnimaux: number;
  currentUtilisateurs: number;
  currentBatiments: number;
}

export interface FeaturesDTO {
  hasAssistantIA: boolean;
  hasAlertesSms: boolean;
  hasSyntheseComplete: boolean;
  hasExportPdf: boolean;
  hasPrevisionPrix: boolean;
}

export interface SubscriptionStatusDTO {
  planId: number | null;
  planNom: string | null;
  statut: 'TRIAL' | 'ACTIVE' | 'GRACE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED';
  accessAutorise: boolean;
  pleinementActif: boolean;
  trialEndsAt: string | null;
  startDate: string | null;
  endDate: string | null;
  graceEndsAt: string | null;
  daysLeft: number | null;
  limits: LimitsDTO;
  features: FeaturesDTO;
}

export interface PaymentRequestDTO {
  planId: number;
  phoneNumber: string;
  otp: string;
}

export interface PaymentResponseDTO {
  success: boolean;
  message: string;
  statut: string | null;
  endDate: string | null;
  refundAmount: number | null;
}

/**
 * Service Angular pour la gestion des abonnements et des paiements.
 *
 * Endpoints couverts :
 *   GET  /api/plans                → liste publique des plans (sans auth)
 *   GET  /api/subscriptions/me     → statut abonnement de la ferme connectée
 *   POST /api/subscriptions/pay    → traitement paiement Orange Money OTP
 */
@Injectable({ providedIn: 'root' })
export class SubscriptionService {

  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Plans actifs triés par ordre — accessible sans token. */
  getPlansPublics(): Observable<PlanPublicDTO[]> {
    return this.http.get<PlanPublicDTO[]>(`${this.base}/api/plans`);
  }

  /** Statut complet de l'abonnement de la ferme connectée (JWT requis). */
  getMySubscription(): Observable<SubscriptionStatusDTO> {
    return this.http.get<SubscriptionStatusDTO>(`${this.base}/api/subscriptions/me`);
  }

  /**
   * Soumet un paiement Orange Money via OTP.
   * Retourne 200 si succès, 402 si échec de paiement.
   */
  pay(request: PaymentRequestDTO): Observable<PaymentResponseDTO> {
    return this.http.post<PaymentResponseDTO>(`${this.base}/api/subscriptions/pay`, request);
  }
}
