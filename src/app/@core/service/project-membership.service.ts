import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectMembershipService {

  baseUrl = `${environment.apiUrl}/api/v1/project-membership`;

  public currentId$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public currentMemberDetails$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);

  constructor(
    private http: HttpClient
  ) { }

  addUserInProject(data: any) {
    console.log("nouveau intervenant",data);
    return this.http.post(`${this.baseUrl}`, data)
  }

  updateMembership(id: string, data: any) {
    console.log ("id envoyé en bd",id)
    console.log ("donnée envoyé",data)
    return this.http.put(`${this.baseUrl}/${id}`, data)
  }

  getMemberById(id: string) {
    return this.http.get(`${this.baseUrl}/${id}`)
  }

  getAllMembers(page = 0, size = 10) {
    return this.http.get(`${this.baseUrl}?page=${page}&size=${size}`);
  }

  getMembersOfProject(projectId: string) {
    return this.http.get(`${this.baseUrl}/project/${projectId}`)
  }

  getMembersOfProject2(projectId: string) {
    return this.http.get(`${this.baseUrl}/project/project-id/${projectId}`)
  }

  getAllPermissions(){
    return this.http.get(`${this.baseUrl}/permissions/all`)
  }

  getAllRoles(){
    return this.http.get(`${this.baseUrl}/roles/all`)
  }

  deleteMembership(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`)
  }

  getMyTasks(projectId: any): Observable<any> {
    if (projectId !== null && projectId !== undefined) {
      return this.http.get(`${this.baseUrl}/tasks?projectId=${projectId}`)
    }
    return this.http.get(`${this.baseUrl}/tasks`)
  }
}
