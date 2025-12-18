import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// 🆕 Nouvelles interfaces
export interface AnimalVenteDTO {
  codeAnimal: string;
  typeVenteId: number;
  poidsVente: number;
  prixUnitaire: number;
}

export interface VenteCreateDTO {
  dateVente: string;  // format dd/MM/yyyy
  client: string;
  animaux: AnimalVenteDTO[];
}

export interface AnimalVenduResponseDTO {
  id: number;
  animalCode: string;
  typeVenteNom: string;
  poidsVente: number;
  prixUnitaire: number;
  montantTotal: number;
}

export interface VenteDetailResponseDTO {
  id: number;
  dateVente: string;
  client: string;
    poidsTotal: number; 
  montantTotal: number;
  animaux: AnimalVenduResponseDTO[];
}

@Injectable({
  providedIn: 'root'
})
export class VenteService {

  private apiUrl = '/api/ventes';

  constructor(private http: HttpClient) {}

  getAll(): Observable<VenteDetailResponseDTO[]> {
    return this.http.get<VenteDetailResponseDTO[]>(this.apiUrl);
  }

  getById(id: number): Observable<VenteDetailResponseDTO> {
    return this.http.get<VenteDetailResponseDTO>(`${this.apiUrl}/${id}`);
  }

  create(data: VenteCreateDTO): Observable<VenteDetailResponseDTO> {
    return this.http.post<VenteDetailResponseDTO>(this.apiUrl, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}