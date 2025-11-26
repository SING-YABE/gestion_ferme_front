// src/app/@core/service/assignation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AssignationResponse {
  idAssignation: number;
  demandeId: number;
  beneficiaireId: number;
   beneficiaireNom: string;        // ← Ajouter
   beneficiairePrenom: string;     // ← Ajouter
  gestionnaireId: number;
  equipementNom: string | null; 
  equipementId: number | null;
  categorieId: number | null;
  categorieNom: string | null;
  statut: 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE';
  dateCreation: string;
}

export interface ChoisirGestionnaireRequest {
  gestionnaireId: number;
}

@Injectable({
  providedIn: 'root'
})
export class AssignationService {
  private apiUrl = 'http://localhost:8080/api/assignations';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  // Récupérer toutes les assignations
  getAll(): Observable<AssignationResponse[]> {
    return this.http.get<AssignationResponse[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  

  // Récupérer une assignation par ID
  getById(id: number): Observable<AssignationResponse> {
    return this.http.get<AssignationResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Choisir un gestionnaire
  choisirGestionnaire(assignationId: number, gestionnaireId: number): Observable<AssignationResponse> {
    const request: ChoisirGestionnaireRequest = { gestionnaireId };
    return this.http.post<AssignationResponse>(
      `${this.apiUrl}/${assignationId}/choisirGestionnaire`,
      request,
      { headers: this.getHeaders() }
    );
  }

  // Sélectionner un équipement
  selectionnerEquipement(assignationId: number, equipementId: number): Observable<AssignationResponse> {
    return this.http.post<AssignationResponse>(
      `${this.apiUrl}/${assignationId}/selectionnerEquipement?equipementId=${equipementId}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // Confirmer l'assignation
  confirmerAssignation(assignationId: number): Observable<AssignationResponse> {
    return this.http.post<AssignationResponse>(
      `${this.apiUrl}/${assignationId}/confirmer`,
      {},
      { headers: this.getHeaders() }
    );
  }
 // Récupérer les assignations où je suis le gestionnaire
getMesAssignations(gestionnaireId: number): Observable<AssignationResponse[]> {
  return this.http.get<AssignationResponse[]>(`${this.apiUrl}/gestionnaire/${gestionnaireId}`, { 
    headers: this.getHeaders() 
  });
}

// Récupérer les assignations sans gestionnaire (pour le dernier approbateur)
getAssignationsSansGestionnaire(): Observable<AssignationResponse[]> {
  return this.http.get<AssignationResponse[]>(`${this.apiUrl}/sans-gestionnaire`, { 
    headers: this.getHeaders() 
  });
}

  // Annuler l'assignation
  annulerAssignation(assignationId: number): Observable<AssignationResponse> {
    return this.http.post<AssignationResponse>(
      `${this.apiUrl}/${assignationId}/annuler`,
      {},
      { headers: this.getHeaders() }
    );
  }
}