import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Vente {
  id?: number;
  dateVente: string;        
  type: string;
  quantite: number;
  poidsTotal: number;
  prixUnitaire: number;
  montantTotal?: number;     
  client: string;
}

@Injectable({
  providedIn: 'root'
})
export class VenteService {

  private apiUrl = '/api/ventes';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Vente[]> {
    return this.http.get<Vente[]>(this.apiUrl);
  }

  getById(id: number): Observable<Vente> {
    return this.http.get<Vente>(`${this.apiUrl}/${id}`);
  }

  create(data: Vente): Observable<Vente> {
    return this.http.post<Vente>(this.apiUrl, data);
  }

  update(id: number, data: Vente): Observable<Vente> {
    return this.http.put<Vente>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
