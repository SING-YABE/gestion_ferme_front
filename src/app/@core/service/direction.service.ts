import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DirectionService {

  constructor(private http: HttpClient) { }

  getAll(page: number = 0, size: number = 1000) {
    return this.http.get(`${environment.apiUrl}/api/v1/directions?page=${page}&size=${size}`);

  }

 setValidator(dto: { directionId: string; validatorId: string }): Observable<any> {
  return this.http.post(`${environment.apiUrl}/api/v1/directions/set-validator`, dto);
}

  createDirection(direction: any){
    return this.http.post(environment.apiUrl + "/api/v1/directions", direction);
  }

  updateDirection(id: string, direction: any){
    return this.http.put(environment.apiUrl + `/api/v1/directions/${id}`, direction);
  }

  deleteDirection(id: string){
    return this.http.delete(environment.apiUrl + `/api/v1/directions/${id}`);
  }
  searchDirectionsByName(name: string, page: number = 0, size: number = 10) {
    return this.http.get(`${environment.apiUrl}/api/v1/directions/search?name=${encodeURIComponent(name)}&page=${page}&size=${size}`);
  }

   delete(id: string): Observable<any> {
      return this.http.delete<any>(`${environment.apiUrl}/api/v1/directions/${id}`);
    }
    getAllWithValidators(): Observable<any> {
  return this.http.get(`${environment.apiUrl}/api/v1/directions/with-validators`);
}

removeValidator(directionId: string): Observable<any> {
  return this.http.delete(`${environment.apiUrl}/api/v1/directions/remove-validator/${directionId}`);
}

searchByName(name: string, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('name', name)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${environment.apiUrl}/search`, { params });
  }

  getValidator(directionId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/validator/${directionId}`);
  }
}
