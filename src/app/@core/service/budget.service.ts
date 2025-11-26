import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  baseUrl = `${environment.apiUrl}/api/v1/annual-budgets`;
  annualBudgetUrl = `${environment.apiUrl}/api/v1/annual-budgets`;
  depenseurl = `${environment.apiUrl}/api/v1/depenses`;
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) { }

  projectBudgets(projectId: String) {
    return this.http.get(`${this.depenseurl}/by-project/${projectId}`);
  }

  findById(budgetId: String) {
    return this.http.get(`${this.annualBudgetUrl}/${budgetId}`);
  }

  createBudget(budget: any) {
    return this.http.post(this.depenseurl, budget)
  }

  updateBudget(id: string, budget: any) {

    console.log("Budget envoyé", budget)
    console.log("id envoyé", id)
    return this.http.put(`${this.annualBudgetUrl}/${id}`, budget)
  }

  delete(id: string) {
    return this.http.delete(`${this.depenseurl}/${id}`);
  }
  deleteAnnualBudget(id: string) {
    return this.http.delete(`${this.annualBudgetUrl}/${id}`);
  }



  createAnnualBudget(annualBudget: any) {
    return this.http.post(this.annualBudgetUrl, annualBudget)
  }
  getAllAnnualBudget(page: any, size: number) {
    return this.http.get(`${this.annualBudgetUrl}?page=${page}&size=${size}`);
  }

  getConnectedUserBudgetsByDirection() {
    return this.http.get(`${this.annualBudgetUrl}/getConnectedUserBudgetsByDirection`);
  }

  getAllBudgetLines(projectId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/v1/annual-budgets/all`, {
      params: { projectId }
    });
  }


  getAllAnnualBudgetWithoutPaginate() {
    return this.http.get<any>(`${this.annualBudgetUrl}/all`);
  }

  getBudgetDepensesByProject(budgetId: string) {
    return this.http.get(`${this.depenseurl}/budget/${budgetId}/group-by-project`);
  }

  getBudgetDepenses(budgetId: string) {
    return this.http.get(`${this.annualBudgetUrl}/getBudgetDepenses/${budgetId}`);
  }


}
