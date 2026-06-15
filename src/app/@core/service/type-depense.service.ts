import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface TypeDepenseDTO {
  id: number;
  nom: string;
}

@Injectable({
  providedIn: 'root'
})
export class TypeDepenseService {

  private apiUrl = 'http://localhost:8001/expenses/types/list';

  constructor(private http: HttpClient) {}
  
  getAll(): Observable<TypeDepenseDTO[]> {
    return this.http.get<TypeDepenseDTO[]>(this.apiUrl);
  }
}