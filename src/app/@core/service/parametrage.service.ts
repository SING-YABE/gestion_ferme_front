import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings } from '../../models/app-settings.model';
export interface ParametresEleveur {
  id?: number;
  seuilNesVivants: number;
  nbMisesBasMax: number;
  seuilOccupationBoxWarning: number;
  seuilOccupationBoxCritique: number;
}

@Injectable({ providedIn: 'root' })
export class ParametrageService {

  private apiUrl = 'http://localhost:8080/api/settings';
  private advisorUrl = 'http://localhost:8080/api/parametres-eleveur';

  constructor(private http: HttpClient) { }

  getSettings(): Observable<AppSettings> {
    return this.http.get<AppSettings>(this.apiUrl);
  }

  updateSettings(data: {
    farmName: string;
    contactEmail: string;
    contactTel: string;
    slogan: string;
  }): Observable<AppSettings> {
    return this.http.put<AppSettings>(this.apiUrl, data);
  }

  uploadLogo(file: File): Observable<AppSettings> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<AppSettings>(`${this.apiUrl}/logo`, formData);
  }

  getParametresEleveur(): Observable<ParametresEleveur> {
    return this.http.get<ParametresEleveur>(this.advisorUrl);
  }

  saveParametresEleveur(data: ParametresEleveur): Observable<ParametresEleveur> {
    return this.http.post<ParametresEleveur>(this.advisorUrl, data);
  }
}






