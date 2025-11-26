// src/app/@core/service/emplacement.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Emplacement {
  idEmplacement: number;
  nom: string;
}

export interface EmplacementDTO {
  nom: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmplacementService {
  private apiUrl = 'http://localhost:8080/api/admin/emplacements';

  constructor(private http: HttpClient) { }

  // CREATE
  create(emplacement: EmplacementDTO): Observable<Emplacement> {
    return this.http.post<Emplacement>(this.apiUrl, emplacement);
  }

  // READ ALL
  getAll(): Observable<Emplacement[]> {
    return this.http.get<Emplacement[]>(this.apiUrl);
  }

  // READ BY ID
  getById(id: number): Observable<Emplacement> {
    return this.http.get<Emplacement>(`${this.apiUrl}/${id}`);
  }

  // UPDATE
  update(id: number, emplacement: EmplacementDTO): Observable<Emplacement> {
    return this.http.put<Emplacement>(`${this.apiUrl}/${id}`, emplacement);
  }

  // DELETE
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}