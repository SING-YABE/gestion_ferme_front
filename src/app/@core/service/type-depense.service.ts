import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface TypeDepenseDTO {
  id?: number;
  nom: string;
}

@Injectable({
  providedIn: 'root'
})
export class TypeDepenseService {
  private baseUrl = '/api/type-depense';

  constructor(private http: HttpClient) {}

  getAll(): Observable<TypeDepenseDTO[]> {
    return this.http.get<TypeDepenseDTO[]>(this.baseUrl);
  }

  create(dto: TypeDepenseDTO): Observable<TypeDepenseDTO> {
    return this.http.post<TypeDepenseDTO>(this.baseUrl, dto);
  }

  update(id: number, dto: TypeDepenseDTO): Observable<TypeDepenseDTO> {
    return this.http.put<TypeDepenseDTO>(`${this.baseUrl}/${id}`, dto);
  }
  
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
