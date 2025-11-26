import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  constructor(private http: HttpClient) { }

  getAll(page: number = 0, size: number = 10) {
    return this.http.get(`${environment.apiUrl}/api/v1/departments?page=${page}&size=${size}`);
  }

  getDepartementOfCurrentUserDirection() {
    return this.http.get(`${environment.apiUrl}/api/v1/departments/getDepartementOfCurrentUserDirection`);
  }


  createDepartment(department: any){
    return this.http.post(`${environment.apiUrl}/api/v1/departments`, department);
  }

  updateDepartment(id: string, department: any){
    return this.http.put(`${environment.apiUrl}/api/v1/departments/${id}`, department);
  }
  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/api/v1/departments/${id}`);
  }
  searchDepartmentsByName(name: string, page: number = 0, size: number = 10) {
    return this.http.get(`${environment.apiUrl}/api/v1/departments/search?name=${encodeURIComponent(name)}&page=${page}&size=${size}`);
  }
}

















