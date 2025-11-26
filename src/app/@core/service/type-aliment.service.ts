import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TypeAlimentDTO {
  libelle: string;
}

export interface TypeAlimentResponseDTO {
  id: number;
  libelle: string;
}

@Injectable({
  providedIn: 'root'
})
export class TypeAlimentService {
  private apiUrl = 'http://localhost:8080/api/type-aliment';

  constructor(private http: HttpClient) {}

  getAll(): Observable<TypeAlimentResponseDTO[]> {
    return this.http.get<TypeAlimentResponseDTO[]>(this.apiUrl);
  }

  create(dto: TypeAlimentDTO): Observable<TypeAlimentResponseDTO> {
    return this.http.post<TypeAlimentResponseDTO>(this.apiUrl, dto);
  }

  update(id: number, dto: TypeAlimentDTO): Observable<TypeAlimentResponseDTO> {
    return this.http.put<TypeAlimentResponseDTO>(`${this.apiUrl}/${id}`, dto);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
