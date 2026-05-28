import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BoxDTO {
  numero: number;
  capaciteMax: number;
  batimentId: number;
}

export interface BoxResponseDTO {
  id: number;
  numero: number;
  code: string;
  capaciteMax: number;
  batimentId: number;
  batimentNom: string;
  occupationActuelle: number;
}

@Injectable({ providedIn: 'root' })
export class BoxService {
  private apiUrl = '/api/boxes';

  constructor(private http: HttpClient) {}

  getAll(): Observable<BoxResponseDTO[]> {
    return this.http.get<BoxResponseDTO[]>(this.apiUrl);
  }

  getById(id: number): Observable<BoxResponseDTO> {
    return this.http.get<BoxResponseDTO>(`${this.apiUrl}/${id}`);
  }

  getByBatiment(batimentId: number): Observable<BoxResponseDTO[]> {
    return this.http.get<BoxResponseDTO[]>(`${this.apiUrl}/batiment/${batimentId}`);
  }

  create(dto: BoxDTO): Observable<BoxResponseDTO> {
    return this.http.post<BoxResponseDTO>(this.apiUrl, dto);
  }

  update(id: number, dto: BoxDTO): Observable<BoxResponseDTO> {
    return this.http.put<BoxResponseDTO>(`${this.apiUrl}/${id}`, dto);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
