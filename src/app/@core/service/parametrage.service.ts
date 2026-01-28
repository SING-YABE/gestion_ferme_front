import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings } from '../../models/app-settings.model';

@Injectable({
  providedIn: 'root'
})
export class ParametrageService {

  private apiUrl = 'http://localhost:8080/api/settings';

  constructor(private http: HttpClient) {}

  //  GET settings
  getSettings(): Observable<AppSettings> {
    return this.http.get<AppSettings>(this.apiUrl);
  }

  // UPDATE nom + email
  updateSettings(data: {
    farmName: string;
    contactEmail: string;
  }): Observable<AppSettings> {
    return this.http.put<AppSettings>(this.apiUrl, data);
  }

  // UPLOAD logo
  uploadLogo(file: File): Observable<AppSettings> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<AppSettings>(
      `${this.apiUrl}/logo`,
      formData
    );
  }
}
