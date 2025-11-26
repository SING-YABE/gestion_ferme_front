import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BatimentDTO {
  nom: string;
  localisation: string;
}

export interface BatimentResponseDTO {
  id: number;
  nom: string;
  localisation: string;
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
export class BatimentService {
  private apiUrl = 'http://localhost:8080/api/batiments';

  constructor(private http: HttpClient) {}

 getAll(): Observable<BatimentResponseDTO[]> {
  return this.http.get<BatimentResponseDTO[]>(this.apiUrl);
}

create(dto: BatimentDTO): Observable<BatimentResponseDTO> {
  return this.http.post<BatimentResponseDTO>(this.apiUrl, dto);
}

update(id: number, dto: BatimentDTO): Observable<BatimentResponseDTO> {
  return this.http.put<BatimentResponseDTO>(`${this.apiUrl}/${id}`, dto);
}

deleteById(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`);
}

}
