import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  private baseUrl: string = `${environment.apiUrl}/api/v1/phasing-templates`;

  constructor(private http: HttpClient) { }

  createTemplate(template: any) {
    return this.http.post(this.baseUrl, template);
  }

  getAll() {
    return this.http.get(this.baseUrl);
  }

  deleteTemplate(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }


  getTemplateById(id: string | undefined) {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  updateTemplate(id: string, template: any) {
    return this.http.put(`${this.baseUrl}/${id}`, template);
  }

  addPhaseToTemplate(templateId: any, phase: any) {
    return this.http.post(this.baseUrl + "/" + templateId +"/add-phase", phase);
  }



  deletePhase(templateId: string, phaseName: string): Observable<any> {
    const requestBody = {
      phasingTemplateId: templateId,
      phaseName: phaseName
    };

    console.log('Requête de suppression:', requestBody);
    return this.http.post(`/api/v1/phasing-templates/deletePhase`, requestBody);

  }
  updatePhaseOfTemplate(request: any) {
    return this.http.post<any>(`${this.baseUrl}/updatePhase`, request);
  }

}
