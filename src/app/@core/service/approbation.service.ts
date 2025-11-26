// src/app/@core/service/approbation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ValiderEtapeRequest {
  emailApprobateur: string;
}

export interface EtapeValidationResponse {
  idEtapeValidation: number;
  ordre: number;
  approbateurId: number | null;
  approbateurNom: string | null;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETEE';
  dateValidation: string | null;
  demandeId: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class ApprobationService {
  private apiUrl = 'http://localhost:8080/api/etapes';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  // Récupérer les étapes en attente pour l'utilisateur connecté
  getEtapesEnAttente(email: string): Observable<EtapeValidationResponse[]> {
    return this.http.get<EtapeValidationResponse[]>(
      `${this.apiUrl}/approbateur/${email}`, 
      { headers: this.getHeaders() }
    );
  }

  // Valider une étape
  validerEtape(etapeId: number, emailApprobateur: string): Observable<EtapeValidationResponse> {
    const request: ValiderEtapeRequest = { emailApprobateur };
    return this.http.post<EtapeValidationResponse>(
      `${this.apiUrl}/${etapeId}/valider`,
      request,
      { headers: this.getHeaders() }
    );
  }

  // Rejeter une étape
  rejeterEtape(etapeId: number, emailApprobateur: string): Observable<EtapeValidationResponse> {
    const request: ValiderEtapeRequest = { emailApprobateur };
    return this.http.post<EtapeValidationResponse>(
      `${this.apiUrl}/${etapeId}/rejeter`,
      request,
      { headers: this.getHeaders() }
    );
  }
}