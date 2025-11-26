import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RisqueService {

  private apiUrl = `${environment.apiUrl}/api/v1/projects`;

  constructor(private http: HttpClient) {}


  addRisk(riskDTO: any): Observable<any> {
    console.log('Données envoyées au serveur:', riskDTO);
        return this.http.post<any>(`${this.apiUrl}/addRisk`, riskDTO);
  }


  getProjectRisks(projectId: string, page: number, size: number): Observable<any> {
    const requestBody = {  page, size, projectId }; // Ajoute projectId dans le corps

    console.log("Envoi de la requête à :", `${this.apiUrl}/getProjectRisks/${projectId}`);
    console.log("Données envoyées :", requestBody);

    return this.http.post<any>(`${this.apiUrl}/getProjectRisks/${projectId}`, requestBody);
  }




  getProjectRiskById(riskId: string, projectId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get/${riskId}/by-project/${projectId}`);
  }

  updateProjectRisk1(riskDTO: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update`, riskDTO);
  }

  updateProjectRisk(id: any, riskDTO: any): Observable<any> {
    const url = `${this.apiUrl}/updateProjectRisk/${id}`;
    return this.http.post<any>(url, riskDTO);
  }



  deleteProjectRisk(riskId: string, projectId: string): Observable<boolean> {
    const url = `${this.apiUrl}/deleteProjectRisk/${riskId}/${projectId}`;
      console.log('Envoi de la requête POST avec l\'URL :', url);

    return this.http.post<boolean>(url, {}).pipe(
      tap(response => {
        console.log('Réponse de la requête :', response);
      })
    );
  }

  getActionPlansByRisk(riskId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/v1/action-plans/by-risk/${riskId}`);
  }

}
