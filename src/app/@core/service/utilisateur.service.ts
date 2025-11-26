// src/app/@core/service/utilisateur.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RoleManagement {
  idRole: number;
  nom: string;
}

export interface Utilisateur {
  idUtilisateur: number;
  poste: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: RoleManagement | null;
}

export interface UtilisateurDTO {
  poste: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
  roleId: number | null;
}

export interface AssignRoleDTO {
  roleId: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = 'http://localhost:8080/api/admin/utilisateurs';

  constructor(private http: HttpClient) { }

  // CREATE
  create(utilisateur: UtilisateurDTO): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(this.apiUrl, utilisateur);
  }

  // READ ALL
  getAll(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.apiUrl);
  }

  // READ BY ID
  getById(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/${id}`);
  }

  // UPDATE
  update(id: number, utilisateur: UtilisateurDTO): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.apiUrl}/${id}`, utilisateur);
  }

  // DELETE
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ASSIGN ROLE
  assignRole(id: number, roleId: number | null): Observable<Utilisateur> {
    const assignRoleDTO: AssignRoleDTO = { roleId };
    return this.http.put<Utilisateur>(`${this.apiUrl}/${id}/role`, assignRoleDTO);
  }
}