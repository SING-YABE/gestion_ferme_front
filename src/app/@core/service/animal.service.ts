import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnimalDTO {
  typeAnimalId: number;
  dateEntree: string;
  poidsInitial: number;
  etatSanteId: number;
  batimentId: number;
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

export interface BatimentInfo {
  id: number;
  nom: string;
  localisation: string;
}

export interface AnimalResponseDTO {
  id: number;
  codeAnimal: string;
  typeAnimal: TypeAnimalInfo;
  dateEntree: string;
  poidsInitial: number;
  etatSante: EtatSanteInfo;
  batiment: BatimentInfo;
  observations?: string;
  vendu: boolean;  
}

@Injectable({
  providedIn: 'root'
})
export class AnimalService {
  private apiUrl = 'http://localhost:8080/api/animaux';

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
}
















