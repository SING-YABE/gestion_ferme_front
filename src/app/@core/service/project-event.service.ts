import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';


export interface ProjectEventData {
  id: any,
  type: string,
  eventDate: string,
  projectId: string,
  comment: string,
  suspensionComment: string,
  authorCuid: string,
}

export interface ProjectEventPaginationRequest {
  projectId: string
  pageNumber?: number
  pageSize?: number
  type?:string
}


@Injectable({
  providedIn: 'root'
})
export class ProjectEventService {

  baseUrl = `${environment.apiUrl}/api/v1/project-event`

  constructor(
    public http: HttpClient
  ) { }

  getAllForProject(request: ProjectEventPaginationRequest) {
    return this.http.post(`${this.baseUrl}/getByProject`, request)
  }

  getAllProjectEventType(){
    return this.http.get(`${this.baseUrl}/getEventType`)
  }

  getAllProjectEventTypeTag(){
    return this.http.get(`${this.baseUrl}/getEventTypeTag`)
  }

  filterByType(value: any){
    return this.http.post(`${this.baseUrl}/filterByEventType`, value)
  }

}
