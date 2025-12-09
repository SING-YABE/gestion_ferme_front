import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface SuiviReproduction {
  id?: number;
  truieId: number;
  verratId: number;
  truie?: {
    codeAnimal: string;
    typeAnimal: { nom: string; prefix: string };
  };
  verrat?: {
    codeAnimal: string;
    typeAnimal: { nom: string; prefix: string };
  };
  dateSaillie: string;
  dateMiseBasPrevue: string;
  dateMiseBasReelle?: string | null;
  nbNesVivants?: number | null;
  nbMortsNes?: number | null;
  nbSevres?: number | null;
  observations?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SuiviReproductionService {
  private apiUrl = '/api/reproductions'; 
 
  constructor(private http: HttpClient) {}

  getAll(): Observable<SuiviReproduction[]> {
    return this.http.get<SuiviReproduction[]>(this.apiUrl);
  }

  create(data: SuiviReproduction): Observable<SuiviReproduction> {
    return this.http.post<SuiviReproduction>(this.apiUrl, data);
  }

  update(id: number, data: SuiviReproduction): Observable<SuiviReproduction> {
    return this.http.put<SuiviReproduction>(`${this.apiUrl}/${id}`, data);
  }

  deleteById(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }


}







