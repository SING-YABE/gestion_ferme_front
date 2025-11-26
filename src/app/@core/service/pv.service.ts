import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class PvService {

  baseUrl = `${environment.apiUrl}/api/v1/process-verbal`;
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) { }

  getByProject(projectId: String) {
    return this.http.get(`${this.baseUrl}/by-project/${projectId}`);
  }


  downlloadFile(poId: String): Observable<any> {
    return this.http.get(`${this.baseUrl}/download-attachment/${poId}`,{ responseType: 'blob', observe: 'response' });
  }

  submitForValidation(poId: String): Observable<any> {
    return this.http.put(`${this.baseUrl}/submit-to-have-budget-line/${poId}`, {});
  }

  validate(po: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/validate-submission`, po);
  }

  createPv(po: any, file: any) {
    const formData = new FormData();

    formData.append(
      'pvDTO',
      new Blob([JSON.stringify(po)], { type: 'application/json' })
    );

    formData.append('file', file);
    return this.http.post(this.baseUrl, formData)
  }

  updatePo(po: any, id: any) {
    return this.http.post(this.baseUrl, po)
  }



  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
