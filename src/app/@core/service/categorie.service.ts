// src/app/@core/service/categorie.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categorie {
  idCategorieEquipement: number;
  nom: string;
  equipements: any[]; // Tu peux typer plus précisément si besoin
}

export interface CategorieDTO {
  nom: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  private apiUrl = 'http://localhost:8080/api/admin/categories';

  constructor(private http: HttpClient) { }

  // CREATE
  create(categorie: CategorieDTO): Observable<Categorie> {
    return this.http.post<Categorie>(this.apiUrl, categorie);
  }

  // READ ALL
  getAll(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.apiUrl);
  }

  // READ BY ID
  getById(id: number): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.apiUrl}/${id}`);
  }

  // UPDATE
  update(id: number, categorie: CategorieDTO): Observable<Categorie> {
    return this.http.put<Categorie>(`${this.apiUrl}/${id}`, categorie);
  }

  // DELETE
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}