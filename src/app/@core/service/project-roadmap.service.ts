import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectRoadmapService {

private apiUrl = `${environment.apiUrl}/api/v1/projectRoadmap`;

  constructor(private http: HttpClient) { }

  create(projectRoadmapData: any): Observable<any> {
    console.log('Envoi des données au serveur:', projectRoadmapData);
    return this.http.post<any>(`${this.apiUrl}/create`, projectRoadmapData);
  }
  
  getAll(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getAll`);
  }
  
  // Récupérer un ProjectType par son ID
  getById(projectRoadmapId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getById/${projectRoadmapId}`);
  }
  
  // Mettre à jour un ProjectType existant
  update(projectRoadmapData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update`, projectRoadmapData);
  }
  
  // Supprimer un ProjectType par son ID
  deleteById(projectRoadmapId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/deleteById/${projectRoadmapId}`);
  }
  
  // Supprimer tous les ProjectType
  deleteAll(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/deleteAll`);
  }
}

