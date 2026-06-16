import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const BASE_URL = environment.apiUrl;

/** Données envoyées au backend pour créer une nouvelle ferme */
export interface RegisterFermeDTO {
  fermeCode: string;       // slug unique : "ferme_bf_001"
  nomFerme: string;        // nom affiché
  adminEmail: string;
  adminPassword: string;
  adminNom: string;
  adminPrenom: string;
}

/** Réponse du backend en cas de succès */
export interface RegisterFermeResponse {
  message: string;
  fermeCode: string;
  schemaName: string;
}

/**
 * Service de gestion des tenants (fermes clientes SaaS).
 * Endpoint public — aucun token JWT requis.
 */
@Injectable({ providedIn: 'root' })
export class TenantService {

  constructor(private http: HttpClient) {}

  /**
   * Inscrit une nouvelle ferme.
   * POST /api/register-ferme
   *
   * Crée côté backend :
   *   - Le schéma PostgreSQL dédié
   *   - Toutes les tables JPA dans ce schéma
   *   - Un utilisateur administrateur
   *   - Un abonnement FREE avec limite 5 animaux
   */
  registerFerme(dto: RegisterFermeDTO): Observable<RegisterFermeResponse> {
    return this.http.post<RegisterFermeResponse>(`${BASE_URL}/api/register-ferme`, dto);
  }
}
