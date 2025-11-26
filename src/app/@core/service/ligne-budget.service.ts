import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class LigneBudgetService {

  baseUrl = `${environment.apiUrl}/api/v1/ligne-budget`;

  constructor(
    private http: HttpClient
  ) { }

  getAllByAnnualBudget(id: String) {
    return this.http.get(`${this.baseUrl}/by-annual-budget/${id}`);
  }

  deleteById(id: String) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  createLigneBudget(ligneBudget: any) {
    return this.http.post(this.baseUrl, ligneBudget)
  }

  getAllByYear(year: any) {
    return this.http.get(`${this.baseUrl}/by-year/${year}`);
  }
}
