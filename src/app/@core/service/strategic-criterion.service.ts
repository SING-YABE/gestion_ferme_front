import { Injectable } from '@angular/core';
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class StrategicCriterionService {

 
   private apiUrl = `${environment.apiUrl}/api/v1/strategicCriterion`;
 
   constructor(private http: HttpClient) { }
 
   create(strategicCriterionData: any): Observable<any> {
     console.log('Envoi  au serveur:', strategicCriterionData);
     return this.http.post<any>(`${this.apiUrl}/create`, strategicCriterionData);
   }
 
   getAll(): Observable<any> {
     return this.http.get<any>(`${this.apiUrl}/getAll`);
   }
   
   getById(strategicCriterionId: string): Observable<any> {
     return this.http.get<any>(`${this.apiUrl}/getById/${strategicCriterionId}`);
   }
   
   update(strategicCriterionData: any): Observable<any> {
     return this.http.put<any>(`${this.apiUrl}/update`, strategicCriterionData);
   }
   
   deleteById(strategicCriterionId: string): Observable<any> {
     return this.http.delete<any>(`${this.apiUrl}/deleteById/${strategicCriterionId}`);
   }
   
   deleteAll(): Observable<any> {
     return this.http.delete<any>(`${this.apiUrl}/deleteAll`);
   }
}
