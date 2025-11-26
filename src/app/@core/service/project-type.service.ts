import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectTypeService {

  private apiUrl = `${environment.apiUrl}/api/v1/projectType`;

  constructor(private http: HttpClient) { }

  create(projectTypeData: any): Observable<any> {
    console.log('Envoi des données au serveur:', projectTypeData);
    return this.http.post<any>(`${this.apiUrl}/create`, projectTypeData);
  }
  
  getAll(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getAll`);
  }
  
  // Récupérer un ProjectType par son ID
  getById(projectTypeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getById/${projectTypeId}`);
  }
  
  // Mettre à jour un ProjectType existant
  update(projectTypeData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update`, projectTypeData);
  }
  
  // Supprimer un ProjectType par son ID
  deleteById(projectTypeId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/deleteById/${projectTypeId}`);
  }
  
  // Supprimer tous les ProjectType
  deleteAll(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/deleteAll`);
  }
}
