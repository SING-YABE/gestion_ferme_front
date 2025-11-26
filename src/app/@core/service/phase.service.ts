import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from "@angular/common/http";
import {catchError, Observable, of, throwError} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PhaseService {

  public baseUrl = `${environment.apiUrl}/api/v1/phases`;
  private readonly deliverableUrl = `${environment.apiUrl}/api/v1/deliverables`;
  private readonly projectUrl = `${environment.apiUrl}/api/v1/projects`;

  constructor(private http: HttpClient) {}

  getById(id: string) {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  attachFiles(deliverableId: number, files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file, file.name);
    });

    return this.http.post(`${this.deliverableUrl}/attach-files/${deliverableId}`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  viewAttachement(deliverableId: number, files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file, file.name);
    });

    return this.http.post(`${this.deliverableUrl}/attach-files/${deliverableId}`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

// telecharger fichier
  downloadAttachment(deliverableId: number, attachmentId: string): Observable<any> {
    const url = `${this.deliverableUrl}/download-attachment/${deliverableId}/${attachmentId}`;
    return this.http.get(url, { responseType: 'blob', observe: 'response' });
  }

  //List fichiers par deliverable
  listAttachments(deliverableId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.deliverableUrl}/list-attachements/${deliverableId}`);
  }

  getLivrables(phaseId: string): Observable<any> {
    return this.http.get<any>(`${this.deliverableUrl}/phase/${phaseId}`);
  }

  editPhase(body: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/updateDates`, body);
  }

  prendreDecision(body: any): Observable<any> {
    return this.http.post<any>(`${this.projectUrl}/updatePhaseStatusAndActivateNextPhase`, body);
  }

  checkLivrable(phaseId: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/checkPhaseDeliverables/${phaseId}`);
  }

createApprovalRequest(requestData: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/approval-requests`, requestData);
}
 
//Checklist 
getChecklists(phaseId: string) {
  return this.http.get<any>(`${environment.apiUrl}/api/v1/checklists/phase/${phaseId}`);
}

updateChecklistStatus(data: any) {
  return this.http.put<any>(`${environment.apiUrl}/api/v1/checklists/check`, data);
}


}
