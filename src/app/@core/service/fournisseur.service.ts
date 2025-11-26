import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FournisseurDTO {
  nom: string;
  contact?: string;
}

export interface FournisseurResponseDTO {
  id: number;
  nom: string;
  contact?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FournisseurService {
  private apiUrl = 'http://localhost:8080/api/fournisseur';

  constructor(private http: HttpClient) {}

  getAll(): Observable<FournisseurResponseDTO[]> {
    return this.http.get<FournisseurResponseDTO[]>(this.apiUrl);
  }

  create(dto: FournisseurDTO): Observable<FournisseurResponseDTO> {
    return this.http.post<FournisseurResponseDTO>(this.apiUrl, dto);
  }

  update(id: number, dto: FournisseurDTO): Observable<FournisseurResponseDTO> {
    return this.http.put<FournisseurResponseDTO>(`${this.apiUrl}/${id}`, dto);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
