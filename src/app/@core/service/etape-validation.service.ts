// src/app/@core/service/etape-validation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StatutValidation } from './demande.service';

export interface EtapeValidationResponseDTO {
  idEtapeValidation: number;
  ordre: number;
  approbateurId: number | null;
  approbateurNom: string | null;
  statut: StatutValidation;
  dateValidation: string | null;
  demandeId: number | null;
}

export interface ValiderEtapeRequestDTO {
  emailApprobateur: string;
}

@Injectable({
  providedIn: 'root'
})
export class EtapeValidationService {
  private apiUrl = 'http://localhost:8080/api/etapes';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  // VALIDER ÉTAPE
  validerEtape(id: number, emailApprobateur: string): Observable<EtapeValidationResponseDTO> {
    const request: ValiderEtapeRequestDTO = { emailApprobateur };
    return this.http.post<EtapeValidationResponseDTO>(`${this.apiUrl}/${id}/valider`, request, { headers: this.getHeaders() });
  }

  // REJETER ÉTAPE
  rejeterEtape(id: number, emailApprobateur: string): Observable<EtapeValidationResponseDTO> {
    const request: ValiderEtapeRequestDTO = { emailApprobateur };
    return this.http.post<EtapeValidationResponseDTO>(`${this.apiUrl}/${id}/rejeter`, request, { headers: this.getHeaders() });
  }

  // ÉTAPES EN ATTENTE POUR APPROBATEUR
  getEtapesEnAttente(email: string): Observable<EtapeValidationResponseDTO[]> {
    return this.http.get<EtapeValidationResponseDTO[]>(`${this.apiUrl}/approbateur/${email}`, { headers: this.getHeaders() });
  }

  // ÉTAPES PAR DEMANDE
  getByDemande(demandeId: number): Observable<EtapeValidationResponseDTO[]> {
    return this.http.get<EtapeValidationResponseDTO[]>(`${this.apiUrl}/demande/${demandeId}`, { headers: this.getHeaders() });
  }

  // TOUTES LES ÉTAPES
  getAll(): Observable<EtapeValidationResponseDTO[]> {
    return this.http.get<EtapeValidationResponseDTO[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // ÉTAPE PAR ID
  getById(id: number): Observable<EtapeValidationResponseDTO> {
    return this.http.get<EtapeValidationResponseDTO>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}