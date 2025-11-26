import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategorieRisquesService {

  constructor(private http: HttpClient) { }

  // Récupérer toutes les catégories de risques
  // getAll(page: number = 0, size: number = 1000): Observable<any> {
  //   return this.http.get(`${environment.apiUrl}/api/v1/risk-category/getAll`);
  // }
  getAll(page: number = 0, size: number = 1000) {
    return this.http.get(`${environment.apiUrl}/api/v1/risk-category/getAll`);
  }
  

  // Créer une nouvelle catégorie de risque
  createRiskCategory(category: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/v1/risk-category/create`, category);
  }

  // Mettre à jour une catégorie de risque
  updateRiskCategory(category: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/v1/risk-category/update`, category);
  }

  // Supprimer une catégorie de risque
  deleteRiskCategory(categoryId: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/api/v1/risk-category/delete/${categoryId}`, {});
  }

  // Récupérer une catégorie de risque par son ID
  getRiskCategoryById(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/risk-category/getById/${id}`);
  }
}
