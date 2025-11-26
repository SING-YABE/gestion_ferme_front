// src/app/@core/service/equipement.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum StatutEquipement {
  DISPONIBLE = 'DISPONIBLE',
  ASSIGNE = 'ASSIGNE', 
  EN_PANNE = 'EN_PANNE'
}

export interface Equipement {
  idEquipement: number;
  nom: string;
  categorieNom: string | null;
  emplacementNom: string | null;
  fournisseurNom: string | null;
  statut: StatutEquipement;
}

export interface EquipementDTO {
  nom: string;
  categorieId: number;
  emplacementId: number;
  fournisseurId: number;
  statut: StatutEquipement;
}

@Injectable({
  providedIn: 'root'
})
export class EquipementService {
  private apiUrl = 'http://localhost:8080/api/admin/equipements';

  constructor(private http: HttpClient) { }

  // CREATE
  create(equipement: EquipementDTO): Observable<Equipement> {
    return this.http.post<Equipement>(this.apiUrl, equipement);
  }

  // READ ALL
  getAll(): Observable<Equipement[]> {
    return this.http.get<Equipement[]>(this.apiUrl);
  }

  // READ BY ID
  getById(id: number): Observable<Equipement> {
    return this.http.get<Equipement>(`${this.apiUrl}/${id}`);
  }

  // UPDATE
  update(id: number, equipement: EquipementDTO): Observable<Equipement> {
    return this.http.put<Equipement>(`${this.apiUrl}/${id}`, equipement);
  }

  // DELETE
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  // Dans equipement.service.ts, ajoutez cette méthode :
// APRÈS (avec @RequestParam) :
getEquipementsDisponiblesParCategorie(categorieId: number): Observable<Equipement[]> {
  return this.http.get<Equipement[]>(`${this.apiUrl}/disponibles?categorieId=${categorieId}`);
}

  // CHANGER STATUT
  changerStatut(id: number, statut: StatutEquipement): Observable<Equipement> {
    return this.http.put<Equipement>(`${this.apiUrl}/${id}/statut?statut=${statut}`, {});
  }
}