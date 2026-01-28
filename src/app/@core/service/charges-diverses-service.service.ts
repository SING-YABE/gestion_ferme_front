import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ChargesDiversesDTO {
  id?: number;
  date: string;
  typeDepenseId: number;
  description: string;
  montant: number;
  modePaiement: string;
  observations?: string;
}

export interface TypeDepenseDTO {
  id: number;
  nom: string;
}

interface ChargesDiversesAPIResponse {
  id?: number;
  date: string;
  type_depense_id: number;
  description: string;
  montant: number;
  mode_paiement: string;
  observations?: string;
}

export interface DepenseSummaryDTO {
  total: {
    montant: number;
    count: number;
  };
  par_categorie: Array<{
    categorie: string;
    montant: number;
    count: number;
  }>;
  par_mode_paiement: Array<{
    mode: string;
    montant: number;
    count: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ChargesDiversesService {

  private apiUrl = 'http://localhost:8000/expenses';

  constructor(private http: HttpClient) {}

  private fromAPI(apiData: ChargesDiversesAPIResponse): ChargesDiversesDTO {
    return {
      id: apiData.id,
      date: apiData.date,
      typeDepenseId: apiData.type_depense_id,
      description: apiData.description,
      montant: apiData.montant,
      modePaiement: apiData.mode_paiement,
      observations: apiData.observations
    };
  }

  private toAPI(dto: ChargesDiversesDTO): any {
    return {
      date: dto.date,
      type_depense_id: dto.typeDepenseId,
      description: dto.description,
      montant: dto.montant,
      mode_paiement: dto.modePaiement,
      observations: dto.observations
    };
  }

  create(depense: ChargesDiversesDTO): Observable<ChargesDiversesDTO> {
    return this.http.post<ChargesDiversesAPIResponse>(this.apiUrl, this.toAPI(depense))
      .pipe(map(response => this.fromAPI(response)));
  }

  getAll(
    skip: number = 0,
    limit: number = 100,
    typeDepenseId?: number,
    dateDebut?: string,
    dateFin?: string,
    modePaiement?: string
  ): Observable<ChargesDiversesDTO[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    if (typeDepenseId) {
      params = params.set('type_depense_id', typeDepenseId.toString());
    }

    if (dateDebut) {
      params = params.set('date_debut', dateDebut);
    }

    if (dateFin) {
      params = params.set('date_fin', dateFin);
    }

    if (modePaiement) {
      params = params.set('mode_paiement', modePaiement);
    }

    return this.http.get<ChargesDiversesAPIResponse[]>(this.apiUrl, { params })
      .pipe(map(responses => responses.map(r => this.fromAPI(r))));
  }

  getById(id: number): Observable<ChargesDiversesDTO> {
    return this.http.get<ChargesDiversesAPIResponse>(`${this.apiUrl}/${id}`)
      .pipe(map(response => this.fromAPI(response)));
  }

  update(id: number, depense: ChargesDiversesDTO): Observable<ChargesDiversesDTO> {
    return this.http.put<ChargesDiversesAPIResponse>(`${this.apiUrl}/${id}`, this.toAPI(depense))
      .pipe(map(response => this.fromAPI(response)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getSummary(dateDebut?: string, dateFin?: string): Observable<DepenseSummaryDTO> {
    let params = new HttpParams();

    if (dateDebut) {
      params = params.set('date_debut', dateDebut);
    }

    if (dateFin) {
      params = params.set('date_fin', dateFin);
    }

    return this.http.get<DepenseSummaryDTO>(`${this.apiUrl}/stats/summary`, { params });
  }
}