import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhaseApprovalService {
  private baseUrl = `${environment.apiUrl}/api/v1/phases/approval-requests`;

  constructor(private http: HttpClient) {}

  getPendingApprovalRequests(): Observable<any> {
    return this.http.get(`${this.baseUrl}/pending`);
  }
  
  createApprovalRequest(request: any): Observable<any> {
    return this.http.post(this.baseUrl, request);
  }

  processApprovalRequest(request: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/process`, request);
  }

  getAllApprovalRequests(): Observable<any> {
  return this.http.get(`${this.baseUrl}`);
}

 getMyApprovalRequests(): Observable<any> {
    return this.http.get(`${this.baseUrl}/mine`);
  }
  getByStatus(status: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/status?status=${status}`);
  }

}