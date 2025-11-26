import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CodeGroupService {

  baseUrl = `${environment.apiUrl}/api/v1/budget-code-groups`;

  constructor(
    private http: HttpClient
  ) { }

  getAllByAnnualBudget(annualBudget: number) {
    return this.http.get(`${this.baseUrl}/by-annual-budget/${annualBudget}`);
  }

  deleteById(id: String) {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  createCodegroup(codeGroup: any) {
    return this.http.post(this.baseUrl, codeGroup)
  }
}
