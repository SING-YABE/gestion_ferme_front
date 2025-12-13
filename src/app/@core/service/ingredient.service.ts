import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IngredientDTO {
  nom: string;
  typeAlimentId: number;
  typeAlimentLibelle: string;
}

export interface IngredientResponseDTO {
  id: number;
  nom: string;
  typeAlimentId: number;
  typeAlimentLibelle: string;
}

@Injectable({
  providedIn: 'root'
})
export class IngredientService {
  private apiUrl = 'http://localhost:8080/api/ingredients';

  constructor(private http: HttpClient) {}

  getAll(): Observable<IngredientResponseDTO[]> {
    return this.http.get<IngredientResponseDTO[]>(this.apiUrl);
  }

  create(dto: IngredientDTO): Observable<IngredientResponseDTO> {
    return this.http.post<IngredientResponseDTO>(this.apiUrl, dto);
  }

  update(id: number, dto: IngredientDTO): Observable<IngredientResponseDTO> {
    return this.http.put<IngredientResponseDTO>(`${this.apiUrl}/${id}`, dto);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
