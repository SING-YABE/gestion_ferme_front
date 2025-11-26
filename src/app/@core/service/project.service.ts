import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {BehaviorSubject, Observable} from "rxjs";
import { HttpParams } from '@angular/common/http';
//ttm
export interface TtmKpiDTO {
  totalTtmProjects: number;
  totalLatePhases: number;
  totalLateTtmProjects: number;
  totalCancelledTtmProjects: number;
  totalSuspendedTtmProjects: number;
  ttmProjectDetails: TtmProjectDetail[];
}

export interface TtmProjectDetail {
  id: string;
  name: string;
  projectId: string;
  status: string;
  priority: string;
  budgetGlobal: number | null;
  budgetReste: number | null;
  projectPercentage: number;
  startDate: number[];
  plannedEndDate: number[];
  isLate: boolean;
  latePhases: number;
  beneficiary: string;
}
// réponse
export interface ProjectSuspensionResponse {
  success: boolean;
  message: string;
}

// icommentaire
export interface ProjectSuspensionComment {
  projectId: number;
  comment: string;
}
export interface ProjectKpiData {
  totalProjects: number;
  suspendedProjects: number;
  projectByStatus: {
    PLANNED: number;
    IN_PROGRESS: number;
    COMPLETED: number;
    CANCELED: number;
    SUSPENDED: number;
  };
  projectByPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
  };
  totalBudget: number;
  remainingBudget: number;
  averageProgress: number;
  projectsByDepartment?: { [departmentName: string]: number };
}

export interface KpiResponse {
  successful: boolean;
  message: string;
  technicalMessage: string | null;
  data: ProjectKpiData;
  code: number;
}
export interface KpiResponseT {
  successful: boolean;
  message: string;
  technicalMessage: string | null;
  data: TtmKpiDTO;
  code: number;
}
@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  public currentProjectId$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public currentProjectDetails$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  public currentRiskID$: BehaviorSubject<string> = new BehaviorSubject<string>("");

  private currentActionPlanIdSubject = new BehaviorSubject<string | null>(null);
  currentActionPlanId$ = this.currentActionPlanIdSubject.asObservable();

  private baseUrl = `${environment.apiUrl}/api/v1/projects`
  constructor(
    private http: HttpClient
  ) { }
  // Dashboar dir/Mang
   
   getKpisForUser(): Observable<KpiResponse> {
      return this.http.get<KpiResponse>(`${this.baseUrl}/kpi`);
    }
    //ttm
    getKpisForTtmResponsable(): Observable<KpiResponseT> {
    return this.http.get<KpiResponseT>(`${this.baseUrl}/kpi/ttm`);
}

 //ttm
    getKpisForNonTtmResponsable(): Observable<KpiResponseT> {
    return this.http.get<KpiResponseT>(`${this.baseUrl}/kpi/non-ttm`);
}

getTtmProjectDetails(status?: string, isLate?: boolean, isSuspended?: boolean): Observable<any> {
  let params = new HttpParams();
  if (status) params = params.set('status', status);
  if (isLate !== undefined) params = params.set('isLate', isLate.toString());
  if (isSuspended !== undefined) params = params.set('isSuspended', isSuspended.toString());
  
  return this.http.get<any>(`${this.baseUrl}/kpi/ttm/details`, { params });
}

getNonTtmProjectDetails(status?: string, isLate?: boolean, isSuspended?: boolean): Observable<any> {
  let params = new HttpParams();
  if (status) params = params.set('status', status);
  if (isLate !== undefined) params = params.set('isLate', isLate.toString());
  if (isSuspended !== undefined) params = params.set('isSuspended', isSuspended.toString());
  
  return this.http.get<any>(`${this.baseUrl}/kpi/non-ttm/details`, { params });
}
  updateProjectManualStatus(projectId: string, newManualStatus: string): Observable<any> {
    const statusRequest = {
      manualStatus: newManualStatus
    };
    return this.http.put(`${this.baseUrl}/${projectId}/status`, statusRequest);
  }

  checkProjectName(name: string){
    return this.http.post(`${environment.apiUrl}/api/v1/projects/check-name`, {name})
  }

  createProject(project: any) {
    return this.http.post(`${environment.apiUrl}/api/v1/projects`, project)
  }

  startProject(projectId: string) {
    return this.http.post(`${this.baseUrl}/${projectId}/start`, {});
}

  requestCodeBudget(projectId: string) {
    return this.http.put(`${environment.apiUrl}/api/v1/projects/submit-to-have-budget-line/${projectId}`, {})
  }

  updateProject(id: string, project: any) {
    return this.http.put(`${environment.apiUrl}/api/v1/projects/${id}`, project)
  }

  getAll(page = 0, size = 10, filter: any = {}){
    return this.http.post(`${environment.apiUrl}/api/v1/projects/all?page=${page}&size=${size}`, filter)
  }

  getUserProjects(){
    return this.http.get(`${environment.apiUrl}/api/v1/projects/getUserProjects`)
  }


  getAllWithoutPaginate(){
    return this.http.get(`${environment.apiUrl}/api/v1/projects/all-without-paginate`)
  }

  getProjectById(id: string) {
    return this.http.get(`${environment.apiUrl}/api/v1/projects/${id}`)
  }

  deleteProjectById(id: string) {
    return this.http.delete(`${environment.apiUrl}/api/v1/projects/delete/${id}`)
  }

  
  setCurrentActionPlanId(actionPlanId: string) {
    this.currentActionPlanIdSubject.next(actionPlanId);
  }

  clearCurrentActionPlanId() {
    this.currentActionPlanIdSubject.next(null);
  }

  projectRiskCountByStatus(id: string) {
    return this.http.get(`${environment.apiUrl}/api/v1/projects/projectRiskCountByStatus/${id}`)
  }

  projectRiskCountByCategory(id: string) {
    return this.http.get(`${environment.apiUrl}/api/v1/projects/projectRiskCountByCategory/${id}`)
  }

  getProjectMembershipCount(id: string) {
    return this.http.get(`${environment.apiUrl}/api/v1/projects/getProjectMembershipCount/${id}`)
  }

  projectBudgetConsommationPercent(id: string) {
    return this.http.get(`${environment.apiUrl}/api/v1/projects/projectBudgetConsommationPercent/${id}`)
  }

  getProjectFinishedPhaseCountAndOtherCount(id: string) {
    return this.http.get(`${environment.apiUrl}/api/v1/projects/getProjectFinishedPhaseCountAndOtherCount/${id}`)
  }

  getProjectDepenseTotalDepenseCount(id: string) {
    return this.http.get(`${environment.apiUrl}/api/v1/projects/getProjectDepenseTotalDepenseCount/${id}`)
  }

  getProjectRisksCount(id: string) {
    return this.http.get(`${environment.apiUrl}/api/v1/projects/getProjectRisksCount/${id}`)
  }

  getProjectActionPlanCount(id: string) {
    return this.http.get(`${environment.apiUrl}/api/v1/projects/getProjectActionPlanCount/${id}`)
  }

  getProjectRisks(projectId: string) {
    return this.http.post(`${environment.apiUrl}/api/v1/projects/getProjectRisks/${projectId}`, {});
  }

  getProjectMemberPermissions(projectId: string){
    console.log ("Id envoyé :", projectId)
    return this.http.get(`${environment.apiUrl}/api/v1/projects/getMemberPermissionForPorject/${projectId}`);
  }

  // suspension projet
  updateProjectSuspensionStatus(comment: ProjectSuspensionComment): Observable<ProjectSuspensionResponse> {
    return this.http.post<ProjectSuspensionResponse>(
      `${environment.apiUrl}/api/v1/projects/updateSuspensionStatus`,
      comment
    );
  }

  //STATUT MANUEL 
  updateProjectStatus(projectId: string, statusRequest: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${projectId}/status`, statusRequest);
}



  //Project KPI
  getProjectKPI(projectId: string) {
    return this.http.get(`${this.baseUrl}/getProjectKpi/${projectId}`)
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/delete/${id}`);
  }
  
  getAllFiltered(page: number, size: number, search?: string, status?: string ,   chefProjetSearch?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (search) {
      params = params.set('search', search);
    }
    
    if (status) {
      params = params.set('status', status);
    }
    
     if (chefProjetSearch && chefProjetSearch.trim()) {
    params = params.set('chefProjetSearch',chefProjetSearch.trim());
  }
    return this.http.get<any>(`${environment.apiUrl}/api/v1/projects/all`, { params });
}


}






















