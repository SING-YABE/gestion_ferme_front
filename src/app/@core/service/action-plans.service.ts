import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs";
@Injectable({
  providedIn: 'root'
})
export class ActionPlansService {

  BASE_URL = `${environment.apiUrl}/api/v1/action-plans`;

  constructor(
    private http: HttpClient
  ) { }

  getActionPlans(){
    return this.http.get(this.BASE_URL);
  }

  getActionPlan(id: string){
    return this.http.get(`${this.BASE_URL}/${id}`);
  }

  deleteActionPlan(id: string){
    return this.http.delete(`${this.BASE_URL}/${id}`);
  }

  updateActionPlan(id: string, data: any){
    return this.http.put(`${this.BASE_URL}/${id}`, data);
  }

  create(value: any) {
    return this.http.post(this.BASE_URL, value);
  }

  getActionPlansByProject(projectId: string) {
    return this.http.get(`${this.BASE_URL}/by-project/${projectId}`);
  }
  getProjectActionPlansProgress(projectId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/v1/action-plans/project/${projectId}/progress`);
  }

  // getActionPlansByRisk(riskId: string) {
  //   return this.http.get(`${environment.apiUrl}/by-risk/${riskId}/action-plans`);
  // }

  getActionPlansByRisk(riskId: string) {
    return this.http.get(`${this.BASE_URL}/by-risk/${riskId}`);
  }
}
