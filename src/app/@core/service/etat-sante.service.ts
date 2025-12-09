import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EtatSanteDTO {
  description: string;
  typeAnimalId: number; 
}


export interface EtatSanteResponseDTO {
  id: number;
  description: string;
  typeAnimal: { 
    id: number;
    nom: string;
    prefix: string;
  };
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
export class EtatSanteService {
  private apiUrl = 'http://localhost:8080/api/etat-sante';

  constructor(private http: HttpClient) {}

  getAll(): Observable<EtatSanteResponseDTO[]> {
    return this.http.get<EtatSanteResponseDTO[]>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<EtatSanteResponseDTO>> {
    return this.http.get<ApiResponse<EtatSanteResponseDTO>>(`${this.apiUrl}/${id}`);
  }

  create(dto: EtatSanteDTO): Observable<ApiResponse<EtatSanteResponseDTO>> {
    return this.http.post<ApiResponse<EtatSanteResponseDTO>>(this.apiUrl, dto);
  }

  update(id: number, dto: EtatSanteDTO): Observable<ApiResponse<EtatSanteResponseDTO>> {
    return this.http.put<ApiResponse<EtatSanteResponseDTO>>(`${this.apiUrl}/${id}`, dto);
  }

  deleteById(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  getByTypeAnimal(typeAnimalId: number): Observable<EtatSanteResponseDTO[]> {
    return this.http.get<EtatSanteResponseDTO[]>(`${this.apiUrl}/by-type/${typeAnimalId}`);
  }
}