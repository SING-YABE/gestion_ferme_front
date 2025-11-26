import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class TaskService {

  baseUrl = `${environment.apiUrl}/api/v1/tasks`;
  shamsyUsersUrl = `${environment.apiUrl}/api/v1/shamsy-users/all`;

  constructor(
    private http: HttpClient
  ) { }

  createTask(task: any){
    return this.http.post(this.baseUrl, task);
  }


  deleteTask(taskId: string){
    return this.http.delete(`${this.baseUrl}/${taskId}`);
  }

  updateTask(taskId: string, task: any){
    return this.http.put(`${this.baseUrl}/${taskId}`, task);
  }


  getActionPlanTasks(actionPlanId: string){
    // return this.http.get(`${this.baseUrl}/action-plan/${actionPlanId}`);
    return this.http.get<any[]>(`${this.baseUrl}/action-plan/${actionPlanId}`);

  }
 
  getShamsyUsers(): Observable<any> {
    return this.http.get(this.shamsyUsersUrl);
  }

  getTasksByProjectAndUser(projectId: string, userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/getShamsyUserTaskForAProject/${projectId}`);
  }

  getConnectedUserTaskForAProject(projectId: string) {
    return this.http.get(`${this.baseUrl}/getConnectedUserTaskForAProject/${projectId}`);
  }

}


