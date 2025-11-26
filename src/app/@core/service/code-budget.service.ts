import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CodeBudgetService {

  baseUrl = `${environment.apiUrl}/api/v1/code-budget`;

  constructor(
    private http: HttpClient
  ) { }

  getAllByGroup(groupId: String) {
    return this.http.get(`${this.baseUrl}/by-group/${groupId}`);
  }

  getAllByAnnualBudget(annualBudgetId: String) {
    return this.http.get(`${this.baseUrl}/by-annual-budget/${annualBudgetId}`);
  }

  deleteById(id: String) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  createCodeBudget(codeBudget: any) {
    return this.http.post(this.baseUrl, codeBudget)
  }
}
