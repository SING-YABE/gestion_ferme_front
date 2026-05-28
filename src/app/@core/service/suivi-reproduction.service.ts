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
       photoUrl?: string;   
    boxCode?: string;   
  };
  verrat?: {
    codeAnimal: string;
    typeAnimal: { nom: string; prefix: string };
     photoUrl?: string;    // ← vérifier que c'est là
    boxCode?: string; 
  };
  dateSaillie: string;
  dateMiseBasPrevue: string;
  dateMiseBasReelle?: string | null;
  nbNesVivants?: number | null;
  nbMortsNes?: number | null;
  nbSevres?: number | null;
  observations?: string;
}
export interface VerratPerformanceDTO {
  truieCode: string;
  dateSaillie: string;
  dateMiseBasReelle?: string;
  nbNesVivants?: number;
  nbMortsNes?: number;
  nbSevres?: number;
}

export interface TruieCarriereDTO {
  rang: number;
  verratCode: string;
  dateSaillie: string;
  dateMiseBasReelle?: string;
  nbNesVivants?: number;
  nbMortsNes?: number;
  nbSevres?: number;
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

getPerformancesVerrat(code: string): Observable<VerratPerformanceDTO[]> {
  return this.http.get<VerratPerformanceDTO[]>(
    `${this.apiUrl}/verrat/${code}/performances`
  );
}

getCarriereTruie(code: string): Observable<TruieCarriereDTO[]> {
  return this.http.get<TruieCarriereDTO[]>(
    `${this.apiUrl}/truie/${code}/carriere`
  );

}}
