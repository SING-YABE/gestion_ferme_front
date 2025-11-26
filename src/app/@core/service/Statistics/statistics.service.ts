import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  constructor(private http: HttpClient) { }


    baseUrl = `${environment.apiUrl}/api/v1/statistics`;
    baseUrlProject = `${environment.apiUrl}/api/v1/projects`;


  getAllStatistics(){
    return this.http.get(`${this.baseUrl}/all`)
  }


  getMyAllStatistics(){
    return this.http.get(`${this.baseUrl}/all/mine`)
  }

  getProjectCountByDirection(){
    return this.http.get(`${this.baseUrlProject}/projectCountByDirection`)
  }

  getProjectCountByDepartement(){
    return this.http.get(`${this.baseUrlProject}/projectCountByDepartment`)
  }



}
