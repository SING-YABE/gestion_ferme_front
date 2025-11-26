import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TypeAnimalDTO {
  nom: string;
  description?: string;
}

export interface TypeAnimalResponseDTO {
  id: number;
  nom: string;
  description?: string;
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
export class TypeAnimalService {
  private apiUrl = 'http://localhost:8080/api/type-animaux';

  constructor(private http: HttpClient) {}

  create(dto: TypeAnimalDTO): Observable<ApiResponse<TypeAnimalResponseDTO>> {
    return this.http.post<ApiResponse<TypeAnimalResponseDTO>>(this.apiUrl, dto);
  }

 
getAll(): Observable<TypeAnimalResponseDTO[]> {
  return this.http.get<TypeAnimalResponseDTO[]>(this.apiUrl);
}


  getById(id: number): Observable<ApiResponse<TypeAnimalResponseDTO>> {
    return this.http.get<ApiResponse<TypeAnimalResponseDTO>>(`${this.apiUrl}/${id}`);
  }

  update(id: number, dto: TypeAnimalDTO): Observable<ApiResponse<TypeAnimalResponseDTO>> {
    return this.http.put<ApiResponse<TypeAnimalResponseDTO>>(`${this.apiUrl}/${id}`, dto);
  }

  deleteById(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}











