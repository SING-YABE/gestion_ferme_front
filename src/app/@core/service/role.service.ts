import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from "../../../environments/environment";


@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private roleApiUrl = `${environment.apiUrl}/obf/commons/auth/roles`;
  private permissionsApiUrl = `${environment.apiUrl}/obf/commons/auth/permissions`;

  constructor(
    private http: HttpClient
  ) { }

  getAllRoles(): Observable<any> {
    return this.http.get<any>(`${this.roleApiUrl}/all`);
  }

  getAllPermissions(): Observable<any> {
    return this.http.get<any>(`${this.permissionsApiUrl}/all`);
  }

  /** Ajouter un rôle */
  createRole(roleData: { name: string; code: string; permissionsId: string[] }): Observable<any> {
    return this.http.post<any>(`${this.roleApiUrl}/save`, roleData);
  }

  /** Mettre à jour un rôle */
  updateRole(id: string, roleData: { name: string; code: string; permissionsId: string[] }): Observable<any> {
    return this.http.patch<any>(`${this.roleApiUrl}/update/${id}`, roleData);
  }

  /** Supprimer un rôle */
  deleteRole(id: string): Observable<any> {
    return this.http.delete<any>(`${this.roleApiUrl}/delete/${id}`);
  }

  // deleteRole(id: string): Observable<any> {
  //   return this.http.delete<any>(`${this.roleApiUrl}/delete/${id}`);
  // }
  

}
