import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TraitementDTO {
  id?: number;
  nom: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TraitementService {
  private baseUrl = '/api/traitement';

  constructor(private http: HttpClient) {}

  getAll(): Observable<TraitementDTO[]> {
    return this.http.get<TraitementDTO[]>(this.baseUrl);
  }

  create(dto: TraitementDTO): Observable<TraitementDTO> {
    return this.http.post<TraitementDTO>(this.baseUrl, dto);
  }

  update(id: number, dto: TraitementDTO): Observable<TraitementDTO> {
    return this.http.put<TraitementDTO>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
