import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ModeVente = 'AU_POIDS' | 'SANS_PESEE';

export interface AnimalVenteDTO {
  codeAnimal: string;
  typeVenteId: number;
  modeVente: ModeVente;
  // AU_POIDS
  poidsVente?: number | null;
  prixUnitaire?: number | null;
  // SANS_PESEE
  prixNegocie?: number | null;
}

export interface VenteCreateDTO {
  dateVente: string;
  dateEnlevement?: string | null;
  dateEnlevementAuPlusTard?: string | null;
  client: string;
  animaux: AnimalVenteDTO[];
}

export interface AnimalVenduResponseDTO {
  id: number;
  animalCode: string;
  typeVenteNom: string;
  modeVente: ModeVente;
  // AU_POIDS
  poidsVente?: number | null;
  prixUnitaire?: number | null;
  // SANS_PESEE
  prixNegocie?: number | null;
  montantTotal: number;
}

export interface VenteDetailResponseDTO {
  id: number;
  dateVente: string;
  client: string;
  poidsTotal: number;
  montantTotal: number;
  animaux: AnimalVenduResponseDTO[];
  dateEnlevement?: string;
  dateEnlevementAuPlusTard?: string;
}

@Injectable({ providedIn: 'root' })
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

  getFacturePdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/facture`, { responseType: 'blob' });
  }
}