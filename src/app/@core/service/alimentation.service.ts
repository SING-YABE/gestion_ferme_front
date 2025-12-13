import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface IngredientAlimentationDTO {
  ingredientId: number;
  quantiteKg: number;
  prixUnitaire: number;
}

export interface AlimentationDTO {
  date: string;
  mode: 'ACHAT' | 'FABRICATION'; 
  fournisseurId?: number | null;
  codeAnimal?: number | null;      
  typeAnimalId?: number | null;
  ingredients: IngredientAlimentationDTO[];
}

export interface TypeAlimentInfo {
  id: number;
  libelle: string;
}

export interface AnimalInfo {
  id: number;
  codeAnimal: string;
}

export interface TypeAnimalInfo {
  id: number;
  nom: string;
}

export interface FournisseurInfo {
  id: number;
  nom: string;
}

export interface AlimentationResponseDTO {
  id: number;
  date: string;
  typeAliment: TypeAlimentInfo;
  quantiteKg: number;
  prixUnitaire: number;
  animal?: AnimalInfo | null;
  typeAnimal?: TypeAnimalInfo | null;
  fournisseur?: FournisseurInfo | null;
  coutTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlimentationService {
  private apiUrl = 'http://localhost:8080/api/alimentations';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AlimentationResponseDTO[]> {
    return this.http.get<AlimentationResponseDTO[]>(this.apiUrl);
  }

  getById(id: number): Observable<AlimentationResponseDTO> {
    return this.http.get<AlimentationResponseDTO>(`${this.apiUrl}/${id}`);
  }

  create(dto: AlimentationDTO): Observable<AlimentationResponseDTO> {
    return this.http.post<AlimentationResponseDTO>(this.apiUrl, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getEvolutionCoutsMensuels(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistiques/couts-mensuels`);
  }

  getEvolutionCoutsMensuelsPeriode(dateDebut: string, dateFin: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistiques/couts-mensuels-periode`, {
      params: { dateDebut, dateFin }
    });
  }
}