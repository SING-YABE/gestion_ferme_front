import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class MediaObjectService {

  BASE_URL = `${environment.apiUrl}/api/v1/media-objects`;
  constructor(private http: HttpClient) { }

  taskAttachments(taskId: string){
    return this.http.get(`${this.BASE_URL}/task-attachments/${taskId}`);
  }

}
