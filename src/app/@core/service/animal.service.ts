import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnimalDTO {
  typeAnimalId: number;
  dateEntree: string;
  poidsInitial: number;
  etatSanteId: number;
  boxId: number;
  observations?: string;
}

export interface TypeAnimalInfo {
  id: number;
  nom: string;
  prefix: string;
}

export interface EtatSanteInfo {
  id: number;
  description: string;
}


export interface AnimalResponseDTO {
  id: number;
  codeAnimal: string;
  typeAnimalId: number;
  typeAnimalNom: string;
  dateEntree: string;
  poidsInitial: number;
  etatSanteId: number;
  etatSanteLibelle: string;
  boxId: number;
  boxCode: string;
  batimentNom: string;
  observations?: string;
  vendu: boolean;
  photoUrl?: string | null;
}


@Injectable({ providedIn: 'root' })
export class AnimalService {
  private apiUrl = '/api/animaux';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AnimalResponseDTO[]> {
    return this.http.get<AnimalResponseDTO[]>(this.apiUrl);
  }

  getById(id: number): Observable<AnimalResponseDTO> {
    return this.http.get<AnimalResponseDTO>(`${this.apiUrl}/${id}`);
  }

  create(dto: AnimalDTO): Observable<AnimalResponseDTO> {
    return this.http.post<AnimalResponseDTO>(this.apiUrl, dto);
  }

  update(id: number, dto: AnimalDTO): Observable<AnimalResponseDTO> {
    return this.http.put<AnimalResponseDTO>(`${this.apiUrl}/${id}`, dto);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadPhoto(id: number, file: File): Observable<{ photoUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post<{ photoUrl: string }>(
    `${this.apiUrl}/${id}/photo`, formData
  );
}


}