import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TraitementDTO {
  id?: number;
  nom: string;
  description: string;
}


export interface TraitementResponseDTO {
  id: number;
  nom: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class TraitementService {
  private baseUrl = '/api/traitement';

  constructor(private http: HttpClient) {}

 
  getAll(): Observable<TraitementResponseDTO[]> {
    return this.http.get<TraitementResponseDTO[]>(this.baseUrl);
  }

  create(dto: TraitementDTO): Observable<TraitementResponseDTO> {
    return this.http.post<TraitementResponseDTO>(this.baseUrl, dto);
  }

  update(id: number, dto: TraitementDTO): Observable<TraitementResponseDTO> {
    return this.http.put<TraitementResponseDTO>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
