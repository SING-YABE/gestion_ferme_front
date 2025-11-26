import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import { catchError, Observable, throwError } from 'rxjs';
import { PageResponse } from '../model/page-response.model';
import { User } from '../model/user.model';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  searchUserFromLdap(query: string = ""){
    return this.http.get(`${environment.apiUrl}/obf/commons/auth/users/ldap/search?query=${query}`);
  }

  import(toImport: any) {
    return this.http.post(`${environment.apiUrl}/api/v1/shamsy-users/import`, toImport)
  }

  // getUsers(page = 0, size = 10) {
  //   return this.http.get(`${environment.apiUrl}/api/v1/shamsy-users?page=${page}&size=${size}`);
  // }

  // getUsers(page = 0, size = 1000): Observable<PageResponse> {
  //   return this.http.get<PageResponse>(`${environment.apiUrl}/api/v1/shamsy-users?page=${page}&size=${size}`);
  // }
  getUsers(page = 0, size = 1000, searchTerm = ''): Observable<PageResponse> {
    let url = `${environment.apiUrl}/api/v1/shamsy-users?page=${page}&size=${size}`;
    
    if (searchTerm && searchTerm.trim() !== '') {
      url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    
    return this.http.get<PageResponse>(url);
  }
  

  deleteById(id: string) {
    return this.http.delete(`${environment.apiUrl}/api/v1/shamsy-users/${id}`)
  }


  //
  getUserRole(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/obf/commons/auth/roles/all`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Une erreur est survenue:', error);
    return throwError(() => new Error('Erreur lors de la récupération des rôles.'));
  }

  updateUser(id: string, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/api/v1/shamsy-users/`, userData).pipe(
      catchError(this.handleError)
    );
  }

  searchUsersBydisplayName(displayName: string, page: number = 0, size: number = 10) {
    return this.http.get(`${environment.apiUrl}/api/v1/shamsy-users/search?displayName=${encodeURIComponent(displayName)}&page=${page}&size=${size}`);
  }


getUsersWithValidatorRole(): Observable<any> {
  return this.http.get(`${environment.apiUrl}/api/v1/shamsy-users/validators`);
}
  
}
