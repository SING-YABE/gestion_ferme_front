import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DeplacementDTO {
  animalId: number;
  nouvelleBoxId: number;
  motif?: string | null;
}

export interface HistoriqueDeplacementResponseDTO {
  id: number;
  animalId: number;
  codeAnimal: string;
  ancienneBoxCode: string | null;
  nouvelleBoxCode: string;
  dateDeplacement: string;
  motif: string | null;
}

@Injectable({ providedIn: 'root' })
export class DeplacementService {
  private apiUrl = '/api/deplacements';

  constructor(private http: HttpClient) {}

  deplacerAnimal(dto: DeplacementDTO): Observable<HistoriqueDeplacementResponseDTO> {
    return this.http.post<HistoriqueDeplacementResponseDTO>(this.apiUrl, dto);
  }

  getAllHistorique(): Observable<HistoriqueDeplacementResponseDTO[]> {
    return this.http.get<HistoriqueDeplacementResponseDTO[]>(this.apiUrl);
  }

  getHistoriqueByAnimal(animalId: number): Observable<HistoriqueDeplacementResponseDTO[]> {
    return this.http.get<HistoriqueDeplacementResponseDTO[]>(`${this.apiUrl}/animal/${animalId}`);
  }
}