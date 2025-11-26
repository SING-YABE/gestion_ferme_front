// src/app/@core/service/demande.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum StatutDemande {
  EN_ATTENTE = 'EN_ATTENTE',
  NON_SOUMISE = 'NON_SOUMISE',
  VALIDE = 'VALIDE',
  REJETEE = 'REJETEE'
}

export enum StatutValidation {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
  REJETEE = 'REJETEE'
}

export interface EtapeValidationDTO {
  id: number;
  ordre: number;
  approbateurId: number;
  approbateurNom: string;
  statut: StatutValidation;
  demandeId: number;
}

export interface Demande {
  idDemande: number;
  dateCreation: string;
  statut: StatutDemande;
  categorieId: number;
  categorieNom: string;
  beneficiaireId: number | null;
  beneficiaireNom: string | null;
  etapesValidation: EtapeValidationDTO[];
}

export interface DemandeDTO {
  categorieId: number;
  beneficiaireId: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class DemandeService {
  private apiUrl = 'http://localhost:8080/api/demandes';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  // CREATE
  create(demande: DemandeDTO): Observable<Demande> {
    return this.http.post<Demande>(this.apiUrl, demande, { headers: this.getHeaders() });
  }

  // READ ALL
  getAll(): Observable<Demande[]> {
    return this.http.get<Demande[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // READ BY ID
  getById(id: number): Observable<Demande> {
    return this.http.get<Demande>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // MES DEMANDES
  getMesDemandes(userId: number): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.apiUrl}/mes-demandes/${userId}`, { headers: this.getHeaders() });
  }

  // UPDATE
  update(id: number, demande: DemandeDTO): Observable<Demande> {
    return this.http.put<Demande>(`${this.apiUrl}/${id}`, demande, { headers: this.getHeaders() });
  }

  // DELETE
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // SOUMETTRE
  soumettre(id: number): Observable<Demande> {
    return this.http.post<Demande>(`${this.apiUrl}/${id}/soumettre`, {}, { headers: this.getHeaders() });
  }

  // GET BY STATUT
  getByStatut(statut: StatutDemande): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.apiUrl}/statut/${statut}`, { headers: this.getHeaders() });
  }

  // GET NON SOUMISES
  getNonSoumises(): Observable<Demande[]> {
    return this.http.get<Demande[]>(`${this.apiUrl}/non-soumises`, { headers: this.getHeaders() });
  }
}