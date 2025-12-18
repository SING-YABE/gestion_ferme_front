import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BatimentResponseDTO } from './batiment.service';
import { Observable } from 'rxjs';
export interface TypeVenteDTO {
  nom: string;
}

export interface TypeVenteResponseDTO {
  id: number;
  nom: string;
}

interface ApiResponse<T> {
  successful: boolean;
  message: string;
  technicalMessage: string | null;
  data: T;
  code: number;
}
@Injectable({
  providedIn: 'root'
})
export class TypeventeService {

   private apiUrl = 'http://localhost:8080/api/typevente';
  
    constructor(private http: HttpClient) {}
  
   getAll(): Observable<TypeVenteResponseDTO[]> {
    return this.http.get<TypeVenteResponseDTO[]>(this.apiUrl);
  }
  
  create(dto: TypeVenteDTO): Observable<TypeVenteResponseDTO> {
    return this.http.post<TypeVenteResponseDTO>(this.apiUrl, dto);
  }
  
  update(id: number, dto: TypeVenteDTO): Observable<TypeVenteResponseDTO> {
    return this.http.put<TypeVenteResponseDTO>(`${this.apiUrl}/${id}`, dto);
  }
  
  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  }
  