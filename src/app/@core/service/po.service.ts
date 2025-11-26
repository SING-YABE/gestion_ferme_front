import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class PoService {

  baseUrl = `${environment.apiUrl}/api/v1/product-orders`;
  ligneBudget = `${environment.apiUrl}/api/v1/ligne-budget`;

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) { }

  getByProject(projectId: String) {
    return this.http.get(`${this.baseUrl}/by-project/${projectId}`);
  }


  getProjectLignes(projectId: String): Observable<any> {
    return this.http.get(`${this.baseUrl}/project-lignes/${projectId}`);
  }


  getPoRequest(status: any = null) {
    if (status !== null) {
      return this.http.get(`${this.ligneBudget}/requests?status=${status}`);
    } else {
      return this.http.get(`${this.ligneBudget}/requests`);
    }
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

  rejectSubmission(data: { comment: string, idDemande: string }): Observable<any> {
    const url = `${this.baseUrl}/reject-submission/${data.idDemande}`;
    return this.http.put(url, { comment: data.comment });
  }

  createPo(po: any, file: any) {
    const formData = new FormData();

    formData.append(
      'productOrderDTO',
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
