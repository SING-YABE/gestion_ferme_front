// src/app/@core/service/role-management.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RoleManagement {
  idRole: number;
  nom: string;
}

export interface RoleManagementDTO {
  nom: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleManagementService {
  private apiUrl = 'http://localhost:8080/api/admin/roles';

  constructor(private http: HttpClient) { }

  // CREATE
  create(role: RoleManagementDTO): Observable<RoleManagement> {
    return this.http.post<RoleManagement>(this.apiUrl, role);
  }

  // READ ALL
  getAll(): Observable<RoleManagement[]> {
    return this.http.get<RoleManagement[]>(this.apiUrl);
  }

  // READ BY ID
  getById(id: number): Observable<RoleManagement> {
    return this.http.get<RoleManagement>(`${this.apiUrl}/${id}`);
  }

  // UPDATE
  update(id: number, role: RoleManagementDTO): Observable<RoleManagement> {
    return this.http.put<RoleManagement>(`${this.apiUrl}/${id}`, role);
  }

  // DELETE
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}