import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChargesDiversesDTO {
  id?: number;
  date: string;
  typeDepenseId: number;
  description: string;
  montant: number;
  modePaiement: string;
  observations?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChargesDiversesService {

  private baseUrl = '/api/charges-diverses';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ChargesDiversesDTO[]> {
    return this.http.get<ChargesDiversesDTO[]>(this.baseUrl);
  }

  create(dto: ChargesDiversesDTO): Observable<ChargesDiversesDTO> {
    return this.http.post<ChargesDiversesDTO>(this.baseUrl, dto);
  }

  update(id: number, dto: ChargesDiversesDTO): Observable<ChargesDiversesDTO> {
    return this.http.put<ChargesDiversesDTO>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
