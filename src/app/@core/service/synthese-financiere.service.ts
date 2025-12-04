import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SyntheseFinanciere {
  totalVentes: number;
  totalCharges: number;
  beneficeNet: number;
}

export interface SyntheseMensuelle {
  mois: string[];
  ventes: number[];
  charges: number[];
  benefices: number[];
}

@Injectable({
  providedIn: 'root'
})
export class SyntheseFinanciereService {

  private baseUrl = '/api/synthese';

  constructor(private http: HttpClient) {}

  getSynthese(start?: string, end?: string): Observable<SyntheseFinanciere> {
    let url = this.baseUrl;

    if (start && end) url += `?start=${start}&end=${end}`;

    return this.http.get<SyntheseFinanciere>(url);
  }

  getSyntheseMensuelle(annee?: number): Observable<SyntheseMensuelle> {
    let url = `${this.baseUrl}/mensuelle`;
    
    if (annee) url += `?annee=${annee}`;
    
    return this.http.get<SyntheseMensuelle>(url);
  }
}